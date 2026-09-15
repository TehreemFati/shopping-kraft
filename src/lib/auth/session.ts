import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  ALL_PERMISSIONS,
  ADMIN_ONLY_PERMISSIONS,
  type Permission,
  normalizePermissions,
} from "@/lib/auth/permissions";
import type { UserRole } from "@/types/database";

export type AdminSession = {
  user: { id: string; email?: string };
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  fullName: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, deleted_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.deleted_at) return null;
  if (!["admin", "staff"].includes(profile.role)) return null;

  if (profile.role === "admin") {
    return {
      user: { id: user.id, email: user.email },
      role: "admin",
      permissions: [...ALL_PERMISSIONS],
      isActive: true,
      fullName: profile.full_name,
    };
  }

  const service = await createServiceClient();
  const { data: staffPerms } = await service
    .from("staff_permissions")
    .select("permissions, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staffPerms || !staffPerms.is_active) {
    return {
      user: { id: user.id, email: user.email },
      role: "staff",
      permissions: [],
      isActive: false,
      fullName: profile.full_name,
    };
  }

  return {
    user: { id: user.id, email: user.email },
    role: "staff",
    permissions: normalizePermissions(staffPerms.permissions ?? []),
    isActive: true,
    fullName: profile.full_name,
  };
}

export function hasPermission(
  session: AdminSession,
  permission: Permission,
): boolean {
  if (session.role === "admin") return true;
  if (!session.isActive) return false;
  if (ADMIN_ONLY_PERMISSIONS.includes(permission)) return false;
  return session.permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!session.isActive) throw new Error("Forbidden");
  if (!hasPermission(session, permission)) throw new Error("Forbidden");

  const supabase = await createClient();
  return { supabase, session, user: session.user };
}

export async function requireAnyPermission(...permissions: Permission[]) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!session.isActive) throw new Error("Forbidden");
  if (!permissions.some((p) => hasPermission(session, p))) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  return { supabase, session, user: session.user };
}

export async function logAdminAction(
  actorId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  meta?: Record<string, unknown>,
) {
  try {
    const service = await createServiceClient();
    await service.from("admin_audit_logs").insert({
      actor_id: actorId,
      action,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
      meta: (meta ?? {}) as import("@/types/database").Json,
    });
  } catch {
    // Non-blocking
  }
}
