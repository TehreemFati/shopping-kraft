import { SaleForm } from "@/components/admin/SaleForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "New Sale" };

export default async function NewSalePage() {
  await requirePermission("sales.manage");
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, price, sale_price")
    .is("deleted_at", null)
    .order("name");

  return (
    <div>
      <AdminPageHeader
        title="Create Sale"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Sales", href: "/admin/sales" },
          { label: "New" },
        ]}
      />
      <SaleForm products={data ?? []} />
    </div>
  );
}
