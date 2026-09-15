import { getAllSettings } from "@/lib/queries/storefront";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Store contact, shipping, and bank details."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
