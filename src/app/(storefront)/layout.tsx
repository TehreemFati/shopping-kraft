import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
