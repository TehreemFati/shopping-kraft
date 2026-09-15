import { notFound } from "next/navigation";
import { getStaffMember } from "@/lib/actions/staff";
import { StaffForm } from "@/components/admin/StaffForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Edit Staff" };

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await getStaffMember(id);
  if (!staff) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit Staff"
        description={staff.full_name ?? staff.email ?? undefined}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Staff", href: "/admin/staff" },
          { label: "Edit" },
        ]}
      />
      <StaffForm staff={staff} />
    </div>
  );
}
