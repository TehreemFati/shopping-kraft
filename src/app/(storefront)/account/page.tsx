import { getCurrentUser } from "@/lib/queries/storefront";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  return <ProfileForm profile={currentUser!.profile!} />;
}
