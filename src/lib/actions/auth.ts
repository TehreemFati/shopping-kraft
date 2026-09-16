"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mergeGuestCart } from "@/lib/actions/cart";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { loginSchema, registerSchema } from "@/lib/validators/schemas";
import { settingsSchema } from "@/lib/validators/schemas";
import type { AdminCustomer } from "@/types/database";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: { _form: [error.message] } };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (isAdminOrStaff(profile?.role)) {
    redirect("/admin");
  }

  await mergeGuestCart(data.user.id);
  redirect("/");
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) return { error: { _form: [error.message] } };

  if (data.user) await mergeGuestCart(data.user.id);

  redirect("/account");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  await supabase.from("profiles").update({ full_name, phone }).eq("id", user.id);

  revalidatePath("/account");
  return { success: true };
}

export async function createAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: formData.get("label") as string,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || null,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postal_code: (formData.get("postal_code") as string) || null,
    is_default: formData.get("is_default") === "on",
  });

  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("addresses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function getUserAddresses(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("is_default", { ascending: false });
  return data ?? [];
}

export async function updateSettings(formData: FormData) {
  const { requirePermission } = await import("@/lib/auth/session");
  const { supabase } = await requirePermission("settings.manage");

  const parsed = settingsSchema.safeParse({
    store_name: formData.get("store_name"),
    currency: formData.get("currency"),
    shipping_flat_rate: formData.get("shipping_flat_rate"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    bank_account: {
      bank: formData.get("bank"),
      account_title: formData.get("account_title"),
      account_number: formData.get("account_number"),
      iban: formData.get("iban"),
    },
    jazzcash_account: {
      account_title: formData.get("jazzcash_account_title"),
      account_number: formData.get("jazzcash_account_number"),
    },
    easypaisa_account: {
      account_title: formData.get("easypaisa_account_title"),
      account_number: formData.get("easypaisa_account_number"),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const entries = [
    { key: "store_name", value: parsed.data.store_name },
    { key: "currency", value: parsed.data.currency },
    { key: "shipping_flat_rate", value: parsed.data.shipping_flat_rate },
    { key: "contact_email", value: parsed.data.contact_email },
    { key: "contact_phone", value: parsed.data.contact_phone },
    { key: "bank_account", value: parsed.data.bank_account },
    { key: "jazzcash_account", value: parsed.data.jazzcash_account },
    { key: "easypaisa_account", value: parsed.data.easypaisa_account },
  ];

  for (const entry of entries) {
    await supabase.from("settings").upsert({
      key: entry.key,
      value: entry.value,
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export type CustomerListFilters = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminCustomers(filters: CustomerListFilters = {}) {
  const { requirePermission } = await import("@/lib/auth/session");
  await requirePermission("customers.view");

  const { createServiceClient } = await import("@/lib/supabase/server");
  const serviceClient = await createServiceClient();

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = serviceClient
    .from("profiles")
    .select("*, orders(count)", { count: "exact" })
    .eq("role", "customer")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.q) {
    query = query.or(
      `full_name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%`,
    );
  }

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  return {
    data: (data ?? []) as AdminCustomer[],
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

export async function getAdminCustomer(id: string) {
  const { requirePermission } = await import("@/lib/auth/session");
  await requirePermission("customers.view");

  const { createServiceClient } = await import("@/lib/supabase/server");
  const serviceClient = await createServiceClient();

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "customer")
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: orders }, { data: addresses }, { data: userData }] =
    await Promise.all([
      serviceClient
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      serviceClient
        .from("addresses")
        .select("*")
        .eq("user_id", id)
        .is("deleted_at", null),
      serviceClient.auth.admin.getUserById(id),
    ]);

  return {
    ...profile,
    email: userData.user?.email ?? null,
    orders: orders ?? [],
    addresses: addresses ?? [],
  };
}
