"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { cartCount, ui, useCart, useWishlist } from "@/lib/store";
import type { CardImg } from "@/lib/card-types";
import { site } from "@/content/site";

export type MenuData = {
  categories: { slug: string; name: string; img: CardImg }[];
  collections: { slug: string; name: string }[];
  feature: CardImg;
};

const primary = [
  { href: "/engagement", label: "Engagement" },
  { href: "/bridal", label: "Bridal" },
  { href: "/bespoke", label: "Bespoke" },
  { href: "/about", label: "Our story" },
];

export function Header({ menu }: { menu: MenuData }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [hoverCat, setHoverCat] = useState(0);
  const closeTimer = useRef<number>(0);
  const megaBtn = useRef<HTMLButtonElement>(null);

  // Close menus on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMega(false);
    setMobile(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Light text while a dark section ([data-dark] / [data-hero-dark]) sits under the header.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = 34;
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-dark], [data-hero-dark]")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom >= y && r.height > 0;
      });
      setOverDark(dark);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    const t = window.setTimeout(check, 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mega && !mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mega) megaBtn.current?.focus();
        setMega(false);
        setMobile(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega, mobile]);

  useEffect(() => {
    if (!mobile) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobile]);

  const dark = (overDark && !mega) || mobile;
  const solid = ((scrolled && !overDark) || mega) && !mobile;

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 220);
  };

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={clsx(
        "fixed inset-x-0 top-0 z-[90] transition-[background-color,color,height,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
        dark ? "text-ivory" : "text-ink",
        solid ? "bg-ivory/92 shadow-[0_1px_0_rgb(14_19_17/0.08)] backdrop-blur-md" : "bg-transparent",
        scrolled && overDark && !mega && !mobile && "bg-ink/40 backdrop-blur-md",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className={clsx("wrap grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500", scrolled ? "h-16" : "h-[4.5rem]")}>
        {/* left */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="-ml-2 grid size-11 place-items-center lg:hidden"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            onClick={() => setMobile((m) => !m)}
          >
            <span className="relative block h-3 w-5">
              <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", mobile ? "top-1.5 rotate-45" : "top-0")} />
              <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", mobile ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            <button
              ref={megaBtn}
              type="button"
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((m) => !m)}
              onMouseEnter={openMega}
              className="flex min-h-11 items-center gap-1.5 px-3 text-[0.8rem] font-medium tracking-[0.14em] uppercase"
            >
              Shop
              <svg viewBox="0 0 10 6" className={clsx("w-2.5 transition-transform duration-500", mega && "rotate-180")} aria-hidden>
                <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
            {primary.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={scheduleClose}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className="link flex min-h-11 items-center px-3 whitespace-nowrap text-[0.8rem] font-medium tracking-[0.14em] uppercase aria-[current=page]:bg-[length:100%_1px]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* logo */}
        <Link href="/" aria-label={`${site.name}, home`} className="flex min-h-11 items-center">
          <Logo compact onDark={dark} />
        </Link>

        {/* right */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <Link href="/appointment" className="link mr-2 hidden min-h-11 items-center text-[0.8rem] font-medium tracking-[0.14em] uppercase xl:flex">
            Book a visit
          </Link>
          <button type="button" aria-label="Search the store" onClick={ui.openSearch} className="grid size-11 place-items-center">
            <svg viewBox="0 0 24 24" className="size-[1.2rem]" aria-hidden>
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <WishLink />
          <BagButton />
        </div>
      </div>

      {/* mega menu */}
      <div
        id="mega-menu"
        onMouseEnter={openMega}
        className={clsx(
          "absolute inset-x-0 top-full hidden overflow-hidden bg-ivory text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] lg:block",
          mega ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        inert={!mega}
      >
        <div className="wrap grid grid-cols-[1fr_1fr_1.1fr_1fr] gap-10 py-10">
          <div>
            <p className="eyebrow mb-4 text-taupe">Categories</p>
            <ul className="space-y-1">
              {menu.categories.map((c, i) => (
                <li key={c.slug} style={{ transitionDelay: mega ? `${80 + i * 45}ms` : "0ms" }} className={clsx("transition-[opacity,transform] duration-700", mega ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
                  <Link
                    href={`/shop/${c.slug}`}
                    onMouseEnter={() => setHoverCat(i)}
                    onFocus={() => setHoverCat(i)}
                    className="group flex min-h-10 items-center gap-3 font-display text-[1.65rem] leading-tight"
                  >
                    <span className="h-px w-0 bg-gold-ink transition-[width] duration-500 group-hover:w-6" aria-hidden />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/shop" className="link mt-5 inline-flex min-h-11 items-center text-sm font-semibold">
              Shop everything →
            </Link>
          </div>
          <div>
            <p className="eyebrow mb-4 text-taupe">Collections</p>
            <ul className="space-y-1">
              {menu.collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="link inline-flex min-h-10 items-center text-[1.02rem]">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <Link href="/gift-cards" className="link inline-flex min-h-10 items-center text-[1.02rem]">
                  Gift cards
                </Link>
              </li>
              <li>
                <Link href="/ring-size-guide" className="link inline-flex min-h-10 items-center text-[1.02rem]">
                  Ring size guide
                </Link>
              </li>
            </ul>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone">
            {menu.categories.map((c, i) => (
              <Image
                key={c.slug}
                src={c.img.src}
                alt=""
                fill
                sizes="22vw"
                quality={60}
                className={clsx("object-cover transition-[opacity,transform] duration-1000 ease-[var(--ease-out-expo)]", hoverCat === i ? "scale-100 opacity-100" : "scale-110 opacity-0")}
              />
            ))}
            <span className="eyebrow absolute bottom-4 left-4 rounded-full bg-ivory/90 px-3 py-1.5 text-ink">{menu.categories[hoverCat]?.name}</span>
          </div>
          <Link href="/engagement/build" className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-ink p-6 text-ivory">
            <Image src={menu.feature.src} alt="" fill sizes="22vw" quality={60} className="object-cover opacity-70 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
            <span className="relative eyebrow text-gold-pale">The ring builder</span>
            <span className="relative mt-2 font-display text-3xl leading-none">Design your engagement ring</span>
            <span className="relative mt-4 text-sm text-ivory/85">Setting, stone, metal, size. Live price. →</span>
          </Link>
        </div>
      </div>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        className={clsx(
          "fixed inset-x-0 top-0 bottom-0 -z-10 overflow-y-auto bg-ink pt-20 text-ivory transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] lg:hidden",
          mobile ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        inert={!mobile}
      >
        <nav aria-label="Mobile" className="wrap pb-32">
          <p className="eyebrow mb-3 text-mist">Shop</p>
          <ul className="grid grid-cols-2 gap-3">
            {menu.categories.map((c, i) => (
              <li key={c.slug} style={{ transitionDelay: mobile ? `${100 + i * 50}ms` : "0ms" }} className={clsx("transition-[opacity,transform] duration-700", mobile ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
                <Link href={`/shop/${c.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-forest">
                  <Image src={c.img.src} alt="" fill sizes="45vw" quality={60} className="object-cover opacity-75" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 font-display text-xl">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-1 border-t border-ivory/15 pt-6">
            {[{ href: "/shop", label: "Shop everything" }, ...primary, { href: "/engagement/build", label: "Ring builder" }, { href: "/collections/on-sale", label: "On sale now" }, { href: "/appointment", label: "Book a showroom visit" }, { href: "/visit", label: "Visit & contact" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-12 items-center font-display text-[1.7rem]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={site.phoneHref} className="mt-8 inline-flex min-h-11 items-center text-gold-pale">
            Call {site.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}

function WishLink() {
  const { slugs } = useWishlist();
  return (
    <Link href="/wishlist" aria-label={`Wishlist${slugs.length ? `, ${slugs.length} saved` : ""}`} className="relative hidden size-11 place-items-center sm:grid">
      <svg viewBox="0 0 24 24" className="size-[1.2rem]" aria-hidden>
        <path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0112 7.4a4.2 4.2 0 017.5 2.5C19.5 15.4 12 20 12 20z" fill={slugs.length ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </Link>
  );
}

function BagButton() {
  const state = useCart();
  const count = cartCount(state);
  return (
    <button type="button" onClick={ui.openDrawer} aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`} className="relative -mr-2 grid size-11 place-items-center" data-bag-target>
      <svg viewBox="0 0 24 24" className="size-[1.25rem]" aria-hidden>
        <path d="M5 8h14l-1.2 12H6.2z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 8V6.5a3 3 0 016 0V8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className="absolute top-1 right-0.5 grid min-w-[1.15rem] place-items-center rounded-full bg-gold px-1 text-[0.65rem] leading-[1.15rem] font-semibold text-ink [animation:bump_0.6s_var(--ease-out-expo)_0.75s]"
        >
          {count}
        </span>
      )}
    </button>
  );
}
