import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-kraft-ink text-primary-foreground">
      <div className="kraft-grain">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="font-display text-3xl tracking-tight text-kraft-citrus">
                Shopping Kraft
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                Good gifts for good relations — curated hampers and custom
                wooden baskets, delivered across Pakistan.
              </p>
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
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>
                  <a
                    href="https://www.instagram.com/shoppingkraft/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-kraft-citrus"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/ShopKraft/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-kraft-citrus"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/@shoppingkraft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-kraft-citrus"
                  >
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Shopping Kraft</p>
            <p>Crafted for Pakistan · Fast nationwide delivery</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
