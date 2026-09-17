import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/storefront";
import { isAdminOrStaff } from "@/lib/auth/roles";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { PageBreadcrumbs } from "@/components/storefront/PageBreadcrumbs";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { AccountNav } from "@/components/account/AccountNav";

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

  return (
    <StorePageShell>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account" },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
        <div className="min-w-0">
          <h1 className="font-display text-2xl tracking-tight text-kraft-ink sm:text-3xl">
            My Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hi, {displayName}
          </p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </div>
      <div className="grid gap-6 md:grid-cols-4 md:gap-8">
        <AccountNav />
        <div className="min-w-0 md:col-span-3">{children}</div>
      </div>
    </StorePageShell>
  );
}
