import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { CardImg } from "@/lib/card-types";

/** Draggable (swipeable) strip of categories with photos. */
export function CategoryRail({ items, current }: { items: { slug: string; name: string; img: CardImg; href: string }[]; current?: string }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-5 overflow-x-auto px-5 md:-mx-10 md:px-10" data-cursor="Drag">
      <ul className="flex w-max gap-3 pb-2">
        {items.map((c) => {
          const active = c.slug === current;
          return (
            <li key={c.slug}>
              <Link
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-full border py-1.5 pr-5 pl-1.5 transition-colors",
                  active ? "border-ink bg-ink text-ivory" : "border-ink/15 hover:border-ink",
                )}
              >
                <span className="relative size-10 overflow-hidden rounded-full bg-bone">
                  <Image src={c.img.src} alt="" fill sizes="40px" quality={60} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </span>
                <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
