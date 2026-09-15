import { notFound } from "next/navigation";
import { getAdminCoupon } from "@/lib/actions/coupons";
import { CouponForm } from "@/components/admin/CouponForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Coupon" };

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getAdminCoupon(id);
  if (!coupon) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit Coupon"
        description={coupon.code}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Coupons", href: "/admin/coupons" },
          { label: "Edit" },
        ]}
      />
      <CouponForm coupon={coupon} />
    </div>
  );
}
