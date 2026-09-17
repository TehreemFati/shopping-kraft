import { BannerForm } from "@/components/admin/BannerForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Banner" };

export default function NewBannerPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Banner"
        description="Hero slides for the storefront homepage."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Banners", href: "/admin/banners" },
          { label: "Add" },
        ]}
      />
      <BannerForm />
    </div>
  );
}
