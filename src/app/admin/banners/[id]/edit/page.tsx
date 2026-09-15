import { notFound } from "next/navigation";
import { getAdminBanner } from "@/lib/actions/banners";
import { BannerForm } from "@/components/admin/BannerForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Banner" };

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getAdminBanner(id);
  if (!banner) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit Banner"
        description={banner.title}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Banners", href: "/admin/banners" },
          { label: "Edit" },
        ]}
      />
      <BannerForm banner={banner} />
    </div>
  );
}
