import Link from "next/link";
import { BrandLogo } from "@/components/storefront/BrandLogo";

export function ErrorSiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/10 bg-kraft-ink text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <BrandLogo size="sm" />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border/70 bg-kraft-ink py-8 text-center text-sm text-white/70">
        <Link href="/shop" className="transition hover:text-kraft-citrus">
          Continue shopping
        </Link>
      </footer>
    </div>
  );
}
