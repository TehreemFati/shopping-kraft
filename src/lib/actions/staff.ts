"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission, logAdminAction } from "@/lib/auth/session";
import {
  normalizePermissions,
  type Permission,
} from "@/lib/auth/permissions";
import { staffCreateSchema, staffUpdateSchema } from "@/lib/validators/schemas";
import type { StaffMember } from "@/types/database";

export type StaffListFilters = {
  q?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
};

export async function getStaffMembers(
  filters: StaffListFilters = {},
): Promise<{
  data: StaffMember[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  await requirePermission("staff.manage");
  const service = await createServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const { data: profiles } = await service
    .from("profiles")
    .select("*")
    .eq("role", "staff")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!profiles?.length) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const ids = profiles.map((p) => p.id);
  const [{ data: perms }, { data: users }] = await Promise.all([
    service.from("staff_permissions").select("*").in("user_id", ids),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const permByUser = new Map((perms ?? []).map((p) => [p.user_id, p]));
  const emailById = new Map(
    (users?.users ?? []).map((u) => [u.id, u.email ?? null]),
  );

  let members: StaffMember[] = profiles.map((p) => {
    const sp = permByUser.get(p.id);
    return {
      ...p,
      email: emailById.get(p.id) ?? null,
      staff_permissions: sp
        ? {
            permissions: sp.permissions,
            is_active: sp.is_active,
            invited_by: sp.invited_by,
            created_at: sp.created_at,
          }
        : null,
    } satisfies StaffMember;
  });

  if (filters.q) {
    const q = filters.q.toLowerCase();
    members = members.filter(
      (m) =>
        m.full_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q),
    );
  }
  if (filters.status === "active") {
    members = members.filter((m) => m.staff_permissions?.is_active);
  }
  if (filters.status === "inactive") {
    members = members.filter((m) => !m.staff_permissions?.is_active);
  }

  const total = members.length;
  const from = (page - 1) * pageSize;
  return {
    data: members.slice(from, from + pageSize),
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getStaffMember(id: string): Promise<StaffMember | null> {
  await requirePermission("staff.manage");
  const service = await createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "staff")
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: sp }, { data: userData }] = await Promise.all([
    service
      .from("staff_permissions")
      .select("permissions, is_active, invited_by, created_at")
      .eq("user_id", id)
      .maybeSingle(),
    service.auth.admin.getUserById(id),
  ]);

  return {
    ...profile,
    email: userData.user?.email ?? null,
    staff_permissions: sp ?? null,
  };
}

export async function createStaff(formData: FormData) {
  const { session } = await requirePermission("staff.manage");

  const rawPermissions = formData.getAll("permissions") as string[];
  const parsed = staffCreateSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    permissions: normalizePermissions(rawPermissions),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const service = await createServiceClient();
  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name },
    });

  if (createError || !created.user) {
    return { error: { _form: [createError?.message ?? "Failed to create user"] } };
  }

  const userId = created.user.id;

  await service
    .from("profiles")
    .update({
      role: "staff",
      full_name: parsed.data.full_name,
    })
    .eq("id", userId);

  const { error: permError } = await service.from("staff_permissions").upsert({
    user_id: userId,
    permissions: parsed.data.permissions,
    is_active: true,
    invited_by: session.user.id,
    updated_at: new Date().toISOString(),
  });

  if (permError) {
    return { error: { _form: [permError.message] } };
  }

  await logAdminAction(session.user.id, "staff.create", "staff", userId, {
    email: parsed.data.email,
    permissions: parsed.data.permissions,
  });

  revalidatePath("/admin/staff");
  return { success: true, id: userId };
}

export async function updateStaff(id: string, formData: FormData) {
  const { session } = await requirePermission("staff.manage");

  const rawPermissions = formData.getAll("permissions") as string[];
  const parsed = staffUpdateSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || null,
    permissions: normalizePermissions(rawPermissions),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const service = await createServiceClient();

  const { data: existing } = await service
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .eq("role", "staff")
    .is("deleted_at", null)
    .maybeSingle();

  if (!existing) return { error: { _form: ["Staff member not found"] } };

  await service
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
    })
    .eq("id", id);

  await service.from("staff_permissions").upsert({
    user_id: id,
    permissions: parsed.data.permissions as Permission[],
    updated_at: new Date().toISOString(),
  });

  await logAdminAction(session.user.id, "staff.update", "staff", id, {
    permissions: parsed.data.permissions,
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  return { success: true };
}

export async function setStaffActive(id: string, isActive: boolean) {
  const { session } = await requirePermission("staff.manage");
  const service = await createServiceClient();

  const { error } = await service
    .from("staff_permissions")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("user_id", id);

  if (error) return { error: error.message };

  await logAdminAction(
    session.user.id,
    isActive ? "staff.enable" : "staff.disable",
    "staff",
    id,
  );

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  return { success: true };
}

export async function softDeleteStaff(id: string) {
  const { session } = await requirePermission("staff.manage");
  const service = await createServiceClient();

  const { error } = await service
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("role", "staff");

  if (error) return { error: error.message };

  await service
    .from("staff_permissions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", id);

  await service.auth.admin.updateUserById(id, { ban_duration: "876000h" });

  await logAdminAction(session.user.id, "staff.delete", "staff", id);

  revalidatePath("/admin/staff");
  return { success: true as const };
}
