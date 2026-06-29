// GET /api/vendor/dashboard/summary — Today's order stats
// GET /api/vendor/dashboard/popular-items — Top items by order count

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'summary';

  if (type === 'popular-items') {
    return getPopularItems(vendor.vendorId);
  }

  return getSummary(vendor.vendorId);
});

async function getSummary(vendorId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      vendorId,
      placedAt: { gte: startOfDay },
    },
    select: { status: true, grandTotal: true },
  });

  const summary = {
    totalOrders: orders.length,
    placed: orders.filter((o) => o.status === 'placed').length,
    accepted: orders.filter((o) => ['accepted', 'preparing'].includes(o.status)).length,
    readyForPickup: orders.filter((o) => o.status === 'ready_for_pickup').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.grandTotal, 0),
  };

  return successResponse(summary);
}

async function getPopularItems(vendorId: string) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        vendorId,
        placedAt: { gte: startOfWeek },
        status: { not: 'cancelled' },
      },
    },
    select: {
      nameSnapshot: true,
      qty: true,
    },
  });

  // Aggregate by item name
  const itemCounts: Record<string, number> = {};
  for (const item of orderItems) {
    const name = item.nameSnapshot;
    itemCounts[name] = (itemCounts[name] || 0) + item.qty;
  }

  // Sort and take top 5
  const popular = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, orderCount: count }));

  return successResponse(popular);
}
