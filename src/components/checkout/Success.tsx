"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import type { Order } from "@/lib/commerce/types";
import { formatPrice } from "@/lib/commerce/pricing";
import { site } from "@/content/site";

const noop = () => () => {};
const read = () => {
  try {
    return sessionStorage.getItem("al-last-order") ?? "";
  } catch {
    return "";
  }
};

/** The ring box: the lid lifts, the ring rises and glints, then the order number fades in. */
function RingBox() {
  return (
    <div className="relative mx-auto h-56 w-64 [perspective:900px]" aria-hidden>
      {/* base */}
      <div className="absolute inset-x-6 bottom-0 h-28 rounded-b-2xl rounded-t-md bg-[linear-gradient(180deg,#24342d,#0e1311)] shadow-[0_30px_50px_-20px_rgba(14,19,17,0.6)]">
        <div className="absolute inset-x-4 top-3 h-14 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_30%,#3a1c22,#1b0d10)]" />
      </div>
      {/* lid */}
      <div className="absolute inset-x-6 bottom-28 h-24 origin-bottom [animation:lid-open_1.3s_var(--ease-out-expo)_0.5s_both] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-t-2xl rounded-b-md bg-[linear-gradient(180deg,#2e4038,#17231e)]">
          <div className="absolute inset-x-6 top-1/2 h-px bg-gold/50" />
        </div>
      </div>
      {/* ring */}
      <div className="absolute bottom-[5.6rem] left-1/2 z-10 -translate-x-1/2 [animation:ring-rise_1.4s_var(--ease-out-expo)_1.1s_both]">
        <svg viewBox="0 0 80 80" className="w-20">
          <defs>
            <linearGradient id="sb-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3dc9b" />
              <stop offset="0.5" stopColor="#c9a55c" />
              <stop offset="1" stopColor="#7d5f26" />
            </linearGradient>
          </defs>
          <ellipse cx="40" cy="54" rx="22" ry="12" fill="none" stroke="url(#sb-gold)" strokeWidth="5" />
          <path d="M40 22 L49 30 L40 44 L31 30 Z" fill="#f4f8fb" stroke="#b9c7d0" strokeWidth="1" />
          <path d="M31 30 H49" stroke="#b9c7d0" strokeWidth="0.8" />
        </svg>
        <span className="absolute -top-2 left-[55%] size-6 [animation:sparkle-once_1.2s_ease-out_2.1s_both]">
          <svg viewBox="0 0 24 24">
            <path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0Z" fill="#fff" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function Success() {
  const raw = useSyncExternalStore(noop, read, () => "");
  const order = useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as Order) : null;
    } catch {
      return null;
    }
  }, [raw]);

  const eta = order
    ? (() => {
        const d = new Date(order.placedAt);
        let left = order.shipping.days[1] + (order.lines.some((l) => l.custom || l.variant.stone) ? 10 : 2);
        while (left > 0) {
          d.setDate(d.getDate() + 1);
          if (d.getDay() !== 0 && d.getDay() !== 6) left--;
        }
        return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      })()
    : "";

  return (
    <div className="mx-auto max-w-3xl py-10 text-center">
      <RingBox />
      <h1 className="mt-10 font-display text-[clamp(2.6rem,6vw,4.4rem)] leading-none">Thank you{order?.address?.firstName ? `, ${order.address.firstName}` : ""}.</h1>
      {order ? (
        <>
          <p className="mt-4 [animation:fade-up_1s_var(--ease-out-expo)_2.2s_both]">
            <span className="spec text-taupe">Order number</span>
            <span className="mt-1 block font-display text-3xl text-gold-ink">{order.number}</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-taupe">
            A receipt is on its way to {order.email} (demo: nothing was actually sent). {order.pickup ? "We'll text you when it's ready at the showroom." : `Estimated delivery: ${eta}.`}
          </p>

          <ol className="mx-auto mt-12 grid max-w-2xl gap-4 text-left sm:grid-cols-4">
            {[
              ["Confirmed", "Payment authorised, receipt emailed."],
              ["At the bench", "Sized, polished and checked under the loupe."],
              ["Boxed & insured", "Oak box, handwritten note, insured for full value."],
              [order.pickup ? "Ready" : "Delivered", order.pickup ? "Pick up in Knox-Henderson." : "Signature on delivery."],
            ].map(([t, d], i) => (
              <li key={t} className="relative rounded-xl border border-ink/10 bg-bone/50 p-4">
                <span className={`grid size-7 place-items-center rounded-full text-xs ${i === 0 ? "bg-gold-ink text-ivory" : "bg-ink/10 text-taupe"}`}>{i === 0 ? "✓" : i + 1}</span>
                <p className="mt-3 font-medium">{t}</p>
                <p className="mt-1 text-sm text-taupe">{d}</p>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-bone p-6 text-left">
            <ul className="space-y-4">
              {order.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-4">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ivory">
                    <Image src={l.image} alt="" fill sizes="56px" quality={60} className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-medium">
                      {l.name} {l.qty > 1 ? `× ${l.qty}` : ""}
                    </span>
                    <span className="block text-xs text-taupe">{l.variantLabel}</span>
                  </span>
                  <span className="text-sm">{formatPrice(l.unitPrice * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-1 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt>{order.shipping.name}</dt>
                <dd>{order.totals.shipping === 0 ? "Free" : formatPrice(order.totals.shipping)}</dd>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between text-gold-ink">
                  <dt>Promo</dt>
                  <dd>−{formatPrice(order.totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>{formatPrice(order.totals.tax, { cents: true })}</dd>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold">
                <dt>Paid with {order.cardBrand} ····{order.cardLast4}</dt>
                <dd>{formatPrice(order.totals.total, { cents: true })}</dd>
              </div>
            </dl>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={`/track?order=${order.number}`} className="btn btn-ink">
              Track this order
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              Keep browsing
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mx-auto mt-4 max-w-md text-taupe">We couldn&apos;t find a recent order in this browser tab. If you just ordered, check your email, or track it with your order number.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/track" className="btn btn-ink">
              Track an order
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              Back to the shop
            </Link>
          </div>
        </>
      )}
      <p className="mt-10 text-sm text-taupe">
        Questions? Call {site.phone} or reply to your receipt. Demo store: no payment was taken.
      </p>
    </div>
  );
}
