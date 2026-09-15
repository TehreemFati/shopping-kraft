import { z } from "zod";
import { ALL_PERMISSIONS } from "@/lib/auth/permissions";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  category_id: z.string().uuid("Select a category"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().optional(),
  country: z.string().default("PK"),
  is_default: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().optional(),
  payment_method: z.enum(["cod", "bank_transfer"]),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(0.01),
  min_order: z.coerce.number().min(0).optional(),
  max_uses: z.coerce.number().min(1).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const settingsSchema = z.object({
  store_name: z.string().min(1),
  currency: z.string().min(1),
  shipping_flat_rate: z.coerce.number().min(0),
  contact_email: z.string().email(),
  contact_phone: z.string().min(1),
  bank_account: z.object({
    bank: z.string(),
    account_title: z.string(),
    account_number: z.string(),
    iban: z.string(),
  }),
});

export const staffCreateSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1, "Select at least one permission"),
});

export const staffUpdateSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().nullable().optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1, "Select at least one permission"),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image_url: z.string().min(1, "Image is required"),
  link_url: z.string().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

export const saleCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  sale_type: z.enum(["flash", "seasonal", "clearance", "custom"]),
  description: z.string().optional(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  product_ids: z.array(z.string().uuid()).default([]),
});

export const variantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  price: z.coerce.number().min(0).optional().nullable(),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
