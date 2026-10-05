import Link from "next/link";
import clsx from "clsx";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

/** Visible breadcrumb trail + BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items, className, onDark }: { items: { name: string; path: string }[]; className?: string; onDark?: boolean }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={clsx("eyebrow", onDark ? "text-mist" : "text-taupe", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((it, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={onDark ? "text-ivory" : "text-ink"}>
                  {it.name}
                </span>
              ) : (
                <>
                  <Link href={it.path} className={clsx("link inline-flex min-h-6 items-center", onDark ? "hover:text-ivory" : "hover:text-ink")}>
                    {it.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbSchema(trail)} />
    </nav>
  );
}
