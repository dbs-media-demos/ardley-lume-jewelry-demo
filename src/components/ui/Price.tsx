import clsx from "clsx";
import { formatPrice } from "@/lib/commerce/pricing";

/** Price as real text. Sale prices show the original struck through, labelled for screen readers. */
export function Price({ price, compareAt, className, from }: { price: number; compareAt?: number; className?: string; from?: boolean }) {
  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      {compareAt ? (
        <>
          <span className="sr-only">Sale price</span>
          <span>{formatPrice(price)}</span>
          <span className="sr-only">, was</span>
          <s className="text-[0.88em] opacity-60">{formatPrice(compareAt)}</s>
        </>
      ) : (
        <span>
          {from && <span className="text-[0.85em] opacity-70">From </span>}
          {formatPrice(price)}
        </span>
      )}
    </span>
  );
}
