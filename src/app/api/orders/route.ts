// POST /api/orders — Place a new order
// GET /api/orders — List current user's orders

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { placeOrderSchema } from '@/lib/validations';
import { successResponse, createdResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { isVendorOpen } from '@/lib/utils';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);
  const body = await request.json();
  const { vendorId, items, specialInstructions } = placeOrderSchema.parse(body);

  // Fetch vendor
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return errorResponse('Vendor not found', 404);
  }

  // Check if vendor is open
  if (!isVendorOpen(vendor.openHours, vendor.isTemporarilyClosed)) {
    return errorResponse('This vendor is currently closed. Please try again later.', 400);
  }

  // Fetch all menu items referenced in the order
  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, vendorId },
    include: {
      customizationGroups: {
        include: { options: true },
      },
    },
  });

  // Validate each item
  const orderItems: Array<{
    menuItemId: string;
    nameSnapshot: string;
    qty: number;
    unitPrice: number;
    selectedOptions: string;
    itemNote: string | undefined;
  }> = [];
  let itemTotal = 0;

  for (const orderItem of items) {
    const menuItem = menuItems.find((mi) => mi.id === orderItem.menuItemId);
    if (!menuItem) {
      return errorResponse(`Item not found: ${orderItem.menuItemId}`, 400);
    }
    if (!menuItem.isAvailable) {
      return errorResponse(`"${menuItem.name}" is currently unavailable`, 400);
    }

    // Resolve every customization against the database. Client-supplied names
    // and prices are display data only and must never determine the charge.
    const availableOptions = menuItem.customizationGroups.flatMap((group) =>
      group.options.map((option) => ({ option, group }))
    );
    const selectedOptionIds = new Set<string>();
    const selectedCountByGroup = new Map<string, number>();
    const trustedOptions: Array<{
      id: string;
      name: string;
      priceDelta: number;
    }> = [];

    for (const requestedOption of orderItem.selectedOptions) {
      const matches = requestedOption.id
        ? availableOptions.filter(({ option }) => option.id === requestedOption.id)
        : availableOptions.filter(({ option }) => option.name === requestedOption.name);

      if (matches.length !== 1) {
        return errorResponse(
          `Invalid customization for "${menuItem.name}". Please add the item again.`,
          400
        );
      }

      const { option, group } = matches[0];
      if (selectedOptionIds.has(option.id)) {
        return errorResponse(`Duplicate customization for "${menuItem.name}"`, 400);
      }

      selectedOptionIds.add(option.id);
      selectedCountByGroup.set(
        group.id,
        (selectedCountByGroup.get(group.id) ?? 0) + 1
      );
      trustedOptions.push({
        id: option.id,
        name: option.name,
        priceDelta: option.priceDelta,
      });
    }

    for (const group of menuItem.customizationGroups) {
      const selectedCount = selectedCountByGroup.get(group.id) ?? 0;
      const minimum = Math.max(group.minSelect, group.required ? 1 : 0);
      const maximum = group.type === 'single' ? 1 : group.maxSelect;

      if (selectedCount < minimum) {
        return errorResponse(
          `Select at least ${minimum} option${minimum === 1 ? '' : 's'} for "${group.name}"`,
          400
        );
      }
      if (selectedCount > maximum) {
        return errorResponse(
          `Select no more than ${maximum} option${maximum === 1 ? '' : 's'} for "${group.name}"`,
          400
        );
      }
    }

    // Calculate item price from authoritative menu values.
    let unitPrice = menuItem.price;
    for (const opt of trustedOptions) {
      unitPrice += opt.priceDelta;
    }

    const lineTotal = unitPrice * orderItem.qty;
    itemTotal += lineTotal;

    orderItems.push({
      menuItemId: menuItem.id,
      nameSnapshot: menuItem.name,
      qty: orderItem.qty,
      unitPrice,
      selectedOptions: JSON.stringify(trustedOptions),
      itemNote: orderItem.itemNote,
    });
  }

  // Check minimum order
  if (itemTotal < vendor.minOrder) {
    const shortfall = ((vendor.minOrder - itemTotal) / 100).toFixed(0);
    return errorResponse(`Minimum order is ₹${(vendor.minOrder / 100).toFixed(0)}. Add ₹${shortfall} more.`, 400);
  }

  const grandTotal = itemTotal + vendor.packagingFee;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: student.userId,
      vendorId,
      status: 'placed',
      itemTotal,
      packagingFee: vendor.packagingFee,
      grandTotal,
      paymentMethod: 'cod',
      specialInstructions,
      estimatedPrepMins: vendor.avgPrepTimeMins,
      statusTimeline: JSON.stringify([
        { status: 'placed', at: new Date().toISOString() },
      ]),
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
      vendor: {
        select: { name: true, area: true, upiId: true, upiQrImageUrl: true, avgPrepTimeMins: true },
      },
    },
  });

  return createdResponse({
    ...order,
    statusTimeline: JSON.parse(order.statusTimeline),
    items: order.items.map((i) => ({
      ...i,
      selectedOptions: JSON.parse(i.selectedOptions),
    })),
  });
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);

  const orders = await prisma.order.findMany({
    where: { userId: student.userId },
    orderBy: { placedAt: 'desc' },
    include: {
      vendor: {
        select: { name: true, imageUrl: true, area: true },
      },
      items: true,
      review: { select: { id: true } },
      feedback: { select: { id: true } },
    },
  });

  return successResponse(
    orders.map((order) => ({
      ...order,
      statusTimeline: JSON.parse(order.statusTimeline),
      items: order.items.map((i) => ({
        ...i,
        selectedOptions: JSON.parse(i.selectedOptions),
      })),
      hasReview: !!order.review,
      hasFeedback: !!order.feedback,
    }))
  );
});
