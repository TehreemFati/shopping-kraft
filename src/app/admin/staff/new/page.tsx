import { StaffForm } from "@/components/admin/StaffForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = { title: "Add Staff" };

export default function NewStaffPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Staff"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Staff", href: "/admin/staff" },
          { label: "Add" },
        ]}
      />
      <StaffForm />
    </div>
  );
}
