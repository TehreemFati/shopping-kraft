import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ErrorPageShell } from "@/components/shared/ErrorPageShell";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <ErrorPageShell
          statusCode={404}
          title="Page not found"
          message="The page you are looking for does not exist or may have been moved."
          primaryAction={{ label: "Go home", href: "/" }}
          secondaryAction={{ label: "Browse shop", href: "/shop" }}
        />
      </main>
      <Footer />
    </>
  );
}
