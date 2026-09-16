import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/storefront";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?redirect=/account");
  if (isAdminOrStaff(currentUser.profile?.role)) redirect("/admin");

  const displayName =
    currentUser.profile?.full_name?.trim() ||
    currentUser.user.email?.split("@")[0] ||
    "there";

  const nav = [
    { href: "/account", label: "Profile" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account" },
        ]}
      />
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hi, {displayName}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </div>
      <div className="grid gap-8 md:grid-cols-4">
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
