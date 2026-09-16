import Link from "next/link";
import { BrandLogo } from "@/components/storefront/BrandLogo";
import { WhatsAppIcon } from "@/components/storefront/WhatsAppIcon";

const WHATSAPP_URL = "https://wa.me/923135009138";
const INSTAGRAM_URL = "https://www.instagram.com/shoppingkraft";
const FACEBOOK_URL = "https://www.facebook.com/ShopKraft/";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

const socialLinkClass =
  "flex size-10 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-kraft-citrus hover:bg-white/10 hover:text-kraft-citrus";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-kraft-ink text-primary-foreground">
      <div className="kraft-grain">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <BrandLogo size="md" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                Good Gifts for Good Relations — curated hampers, gift boxes,
                and custom presents delivered across Pakistan.
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className={socialLinkClass}
                >
                  <WhatsAppIcon className="size-5" />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={socialLinkClass}
                >
                  <InstagramIcon className="size-5" />
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={socialLinkClass}
                >
                  <FacebookIcon className="size-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                <li>
                  <Link href="/shop" className="transition hover:text-kraft-citrus">
                    Full catalog
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="transition hover:text-kraft-citrus">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="transition hover:text-kraft-citrus">
                    Bag
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                Account
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                <li>
                  <Link href="/account" className="transition hover:text-kraft-citrus">
                    My account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    className="transition hover:text-kraft-citrus"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-kraft-citrus">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                Contact
              </h4>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                hello@shoppingkraft.com
                <br />
                +92 313 5009138
                <br />
                <span className="text-white/60">
                  Shop F111, 1st floor, Rabi Saddar, Adamjee Road, Saddar
                  Rawalpindi
                </span>
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Shopping Kraft</p>
            <p>Good Gifts for Good Relations</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
