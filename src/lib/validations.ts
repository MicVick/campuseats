// Zod Validation Schemas
// Shared validation schemas for API request bodies

import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────────────

const IIMA_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@iima\.ac\.in$/;

export const requestOtpSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine((email) => IIMA_EMAIL_REGEX.test(email), {
      message: 'Only @iima.ac.in email addresses are allowed',
    }),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .email()
    .refine((email) => IIMA_EMAIL_REGEX.test(email), {
      message: 'Only @iima.ac.in email addresses are allowed',
    }),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

// ─── Vendor Auth Schemas ────────────────────────────────────────

export const vendorLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const vendorChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// ─── Discovery Schemas ──────────────────────────────────────────

export const vendorListQuerySchema = z.object({
  openNow: z.enum(['true', 'false']).optional(),
  veg: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  sort: z.enum(['rating', 'prepTime', 'price']).optional(),
  q: z.string().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  veg: z.enum(['true', 'false']).optional(),
});

// ─── Order Schemas ──────────────────────────────────────────────

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  qty: z.number().int().min(1).max(50),
  selectedOptions: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      // Display-only client value. The order API always reloads the price.
      priceDelta: z.number().int().optional(),
    })
  ).default([]),
  itemNote: z.string().max(500).optional(),
});

export const placeOrderSchema = z.object({
  vendorId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  specialInstructions: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ─── Review & Feedback Schemas ──────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

export const foodFeedbackSchema = z.object({
  foodQuality: z.number().int().min(1).max(5),
  hygiene: z.number().int().min(1).max(5),
  valueForMoney: z.number().int().min(1).max(5),
  itemComments: z.string().max(1000).optional(),
  comments: z.string().max(1000).optional(),
  flagForMvrc: z.boolean().default(false),
});

// ─── Vendor Portal Schemas ──────────────────────────────────────

export const vendorOrderActionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  price: z.number().int().min(0), // in paise
  isVeg: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  customizationGroups: z.array(
    z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['single', 'multi']),
      required: z.boolean().default(false),
      minSelect: z.number().int().min(0).default(0),
      maxSelect: z.number().int().min(1).default(1),
      options: z.array(
        z.object({
          name: z.string().min(1).max(100),
          priceDelta: z.number().int().default(0),
        })
      ).min(1),
    })
  ).optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().int().min(0).optional(),
  isVeg: z.boolean().optional(),
  imageUrl: z.string().url().optional().nullable(),
  categoryId: z.string().uuid().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

const operatingTimeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Time must use a valid HH:MM value');

const operatingHoursEntrySchema = z.object({
  open: operatingTimeSchema,
  close: operatingTimeSchema,
});

export const updateVendorProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  cuisineTags: z.array(z.string()).optional(),
  area: z.string().max(200).optional(),
  upiId: z.string().max(100).optional().nullable(),
  upiQrImageUrl: z.string().url().optional().nullable(),
  minOrder: z.number().int().min(0).optional(),
  packagingFee: z.number().int().min(0).optional(),
  avgPrepTimeMins: z.number().int().min(1).max(120).optional(),
  openHours: z
    .object({
      mon: operatingHoursEntrySchema.optional(),
      tue: operatingHoursEntrySchema.optional(),
      wed: operatingHoursEntrySchema.optional(),
      thu: operatingHoursEntrySchema.optional(),
      fri: operatingHoursEntrySchema.optional(),
      sat: operatingHoursEntrySchema.optional(),
      sun: operatingHoursEntrySchema.optional(),
    })
    .strict()
    .optional(),
  isTemporarilyClosed: z.boolean().optional(),
});

// ─── Favourites ─────────────────────────────────────────────────

export const addFavouriteSchema = z.object({
  vendorId: z.string().uuid(),
});

// ─── Promo Code ─────────────────────────────────────────────────

export const validatePromoSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().min(0),
});
