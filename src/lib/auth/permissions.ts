export const ALL_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.manage",
  "categories.view",
  "categories.manage",
  "orders.view",
  "orders.manage",
  "customers.view",
  "customers.manage",
  "inventory.view",
  "inventory.manage",
  "coupons.view",
  "coupons.manage",
  "settings.manage",
  "staff.manage",
  "reviews.view",
  "reviews.manage",
  "banners.view",
  "banners.manage",
  "sales.view",
  "sales.manage",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const ADMIN_ONLY_PERMISSIONS: Permission[] = [
  "settings.manage",
  "staff.manage",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard.view": "View dashboard",
  "products.view": "View products",
  "products.manage": "Manage products",
  "categories.view": "View categories",
  "categories.manage": "Manage categories",
  "orders.view": "View orders",
  "orders.manage": "Manage orders",
  "customers.view": "View customers",
  "customers.manage": "Manage customers",
  "inventory.view": "View inventory",
  "inventory.manage": "Manage inventory",
  "coupons.view": "View coupons",
  "coupons.manage": "Manage coupons",
  "settings.manage": "Manage settings",
  "staff.manage": "Manage staff",
  "reviews.view": "View reviews",
  "reviews.manage": "Manage reviews",
  "banners.view": "View banners",
  "banners.manage": "Manage banners",
  "sales.view": "View sales",
  "sales.manage": "Manage sales",
};

export type PermissionPreset = {
  id: string;
  label: string;
  description: string;
  permissions: Permission[];
};

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: "fulfillment",
    label: "Order Fulfillment",
    description: "Dashboard, orders, and inventory view",
    permissions: [
      "dashboard.view",
      "orders.view",
      "orders.manage",
      "inventory.view",
      "customers.view",
    ],
  },
  {
    id: "catalog",
    label: "Catalog Manager",
    description: "Products, categories, and inventory",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.manage",
      "categories.view",
      "categories.manage",
      "inventory.view",
      "inventory.manage",
    ],
  },
  {
    id: "support",
    label: "Support",
    description: "Customers and order viewing",
    permissions: [
      "dashboard.view",
      "orders.view",
      "customers.view",
      "customers.manage",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Coupons, banners, reviews, and sales",
    permissions: [
      "dashboard.view",
      "coupons.view",
      "coupons.manage",
      "banners.view",
      "banners.manage",
      "reviews.view",
      "reviews.manage",
      "sales.view",
      "sales.manage",
    ],
  },
  {
    id: "full",
    label: "Full Staff",
    description: "All operational modules (no settings/staff)",
    permissions: ALL_PERMISSIONS.filter(
      (p) => !ADMIN_ONLY_PERMISSIONS.includes(p),
    ),
  },
];

/** Route prefix → minimum permission to enter */
export const ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin/staff", permission: "staff.manage" },
  { prefix: "/admin/settings", permission: "settings.manage" },
  { prefix: "/admin/products", permission: "products.view" },
  { prefix: "/admin/categories", permission: "categories.view" },
  { prefix: "/admin/orders", permission: "orders.view" },
  { prefix: "/admin/customers", permission: "customers.view" },
  { prefix: "/admin/inventory", permission: "inventory.view" },
  { prefix: "/admin/coupons", permission: "coupons.view" },
  { prefix: "/admin/reviews", permission: "reviews.view" },
  { prefix: "/admin/banners", permission: "banners.view" },
  { prefix: "/admin/sales", permission: "sales.view" },
  { prefix: "/admin", permission: "dashboard.view" },
];

export function permissionForPath(pathname: string): Permission | null {
  const sorted = [...ROUTE_PERMISSIONS].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  );
  for (const route of sorted) {
    if (pathname === route.prefix || pathname.startsWith(route.prefix + "/")) {
      return route.permission;
    }
    if (route.prefix === "/admin" && pathname === "/admin") {
      return route.permission;
    }
  }
  return null;
}

export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(value);
}

export function normalizePermissions(values: string[]): Permission[] {
  return values.filter(isPermission);
}
