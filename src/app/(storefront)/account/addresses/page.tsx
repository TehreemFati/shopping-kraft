import { getCurrentUser } from "@/lib/queries/storefront";
import { getUserAddresses } from "@/lib/actions/auth";
import { AddressesPage } from "@/components/account/AddressesPage";

export const metadata = { title: "Addresses" };

export default async function AccountAddressesPage() {
  const currentUser = await getCurrentUser();
  const addresses = await getUserAddresses(currentUser!.user.id);

  return <AddressesPage addresses={addresses} />;
}
