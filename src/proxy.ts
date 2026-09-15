import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  permissionForPath,
  normalizePermissions,
  ADMIN_ONLY_PERMISSIONS,
  type Permission,
} from "@/lib/auth/permissions";

function canAccess(
  role: string,
  permissions: Permission[],
  isActive: boolean,
  required: Permission,
): boolean {
  if (role === "admin") return true;
  if (!isActive) return false;
  if (ADMIN_ONLY_PERMISSIONS.includes(required)) return false;
  return permissions.includes(required);
}

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, deleted_at")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      profile.deleted_at ||
      !["admin", "staff"].includes(profile.role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    let permissions: Permission[] = [];
    let isActive = true;

    if (profile.role === "staff") {
      const { data: staffPerms } = await supabase
        .from("staff_permissions")
        .select("permissions, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      isActive = staffPerms?.is_active ?? false;
      permissions = normalizePermissions(staffPerms?.permissions ?? []);

      if (!isActive) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    const required = permissionForPath(pathname);
    if (
      required &&
      !canAccess(profile.role, permissions, isActive, required)
    ) {
      // Prefer dashboard if allowed; otherwise first permitted module; else storefront
      const fallbacks = [
        "/admin",
        "/admin/orders",
        "/admin/products",
        "/admin/customers",
        "/admin/inventory",
        "/admin/categories",
        "/admin/coupons",
        "/admin/sales",
        "/admin/reviews",
        "/admin/banners",
      ];
      const nextPath =
        fallbacks.find((path) => {
          if (path === pathname) return false;
          const need = permissionForPath(path);
          return need
            ? canAccess(profile.role, permissions, isActive, need)
            : false;
        }) ?? "/";

      const url = request.nextUrl.clone();
      url.pathname = nextPath;
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
