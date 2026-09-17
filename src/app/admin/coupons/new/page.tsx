import { CouponForm } from "@/components/admin/CouponForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Coupon" };

export default function NewCouponPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Coupon"
        description="Discount codes for checkout."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Coupons", href: "/admin/coupons" },
          { label: "Add" },
        ]}
      />
      <CouponForm />
    </div>
  );
}
