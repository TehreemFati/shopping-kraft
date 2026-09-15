import { notFound } from "next/navigation";
import { SaleForm } from "@/components/admin/SaleForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminSale } from "@/lib/actions/sales";
import { createServiceClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "Edit Sale" };

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("sales.manage");
  const { id } = await params;
  const [sale, productRes] = await Promise.all([
    getAdminSale(id),
    (async () => {
      const supabase = await createServiceClient();
      return supabase
        .from("products")
        .select("id, name, price, sale_price")
        .is("deleted_at", null)
        .order("name");
    })(),
  ]);

  if (!sale) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit Sale"
        description={sale.name}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Sales", href: "/admin/sales" },
          { label: "Edit" },
        ]}
      />
      <SaleForm sale={sale} products={productRes.data ?? []} />
    </div>
  );
}
