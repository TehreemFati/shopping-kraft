import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session || !session.isActive) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <AdminSidebar permissions={session.permissions} />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
