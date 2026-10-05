"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useState } from "react";
import clsx from "clsx";
import { cart, ui, useCart, type CartState } from "@/lib/store";
import { computeTotals, formatPrice, isPromoValid, metalTone } from "@/lib/commerce/pricing";
import type { CartLine } from "@/lib/commerce/types";
import { site } from "@/content/site";
import { useCatalog } from "@/lib/use-catalog";
import { EngravingPreview } from "./EngravingPreview";
import { addToCart } from "@/lib/add-to-cart";
import { defaultVariant, variantKey, variantLabel, variantPrice } from "@/lib/commerce/pricing";
import { asPriceInput } from "@/lib/card-types";

const ENGRAVABLE_SLUGS = ["fine-id-bracelet", "initial-tag", "lume-signet"];

/** Everything in the bag. Used by the drawer (compact) and the /cart page. */
export function CartContents({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const state = useCart();
  const totals = computeTotals(state.lines, state.extras);
  const progress = Math.min(1, (site.freeShippingOver - totals.freeShippingRemaining) / site.freeShippingOver);

  if (!state.lines.length) return <EmptyBag compact={compact} onNavigate={onNavigate} removed={state.removed} />;

  return (
    <div className={clsx(compact ? "flex min-h-0 flex-1 flex-col" : "grid gap-12 lg:grid-cols-[1.5fr_1fr]")}>
      <div className={clsx(compact && "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6")}>
        {/* free shipping progress */}
        <div className={clsx("rounded-xl bg-bone p-4", compact ? "mt-4" : "")}>
          <p className="text-sm">
            {totals.freeShippingRemaining > 0 ? (
              <>
                You&apos;re <strong>{formatPrice(totals.freeShippingRemaining)}</strong> away from free insured shipping.
              </>
            ) : (
              <>
                <span aria-hidden>✦ </span>Free insured shipping unlocked.
              </>
            )}
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="h-full origin-left rounded-full bg-gold-ink transition-transform duration-700 ease-[var(--ease-out-expo)]" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>

        {state.removed && (
          <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <span>Removed {state.removed.line.name}.</span>
            <button type="button" onClick={cart.undo} className="link-under min-h-11 font-semibold">
              Undo
            </button>
          </div>
        )}

        <ul className="mt-2 divide-y divide-ink/10">
          {state.lines.map((l) => (
            <Line key={l.id} line={l} compact={compact} onNavigate={onNavigate} />
          ))}
        </ul>

        <GiftOptions state={state} />
        {compact && <CrossSells exclude={state.lines.map((l) => l.slug)} />}
      </div>

      <div className={clsx(compact ? "border-t border-ink/10 bg-ivory px-6 pt-4 pb-6" : "self-start rounded-2xl bg-bone p-6 lg:sticky lg:top-28")}>
        {!compact && <h2 className="mb-4 font-display text-3xl">Summary</h2>}
        <Promo code={state.extras.promo} />
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-gold-ink">
              <dt>{site.promo.code} (−{site.promo.percent}%)</dt>
              <dd>−{formatPrice(totals.discount)}</dd>
            </div>
          )}
          {totals.engraving > 0 && (
            <div className="flex justify-between">
              <dt>Engraving</dt>
              <dd>{formatPrice(totals.engraving)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Insured shipping</dt>
            <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between text-taupe">
            <dt>Sales tax</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
            <dt>Estimated total</dt>
            <dd>{formatPrice(totals.subtotal - totals.discount + totals.engraving + totals.shipping)}</dd>
          </div>
        </dl>
        <Link href="/checkout" onClick={onNavigate} className="btn btn-ink mt-5 w-full py-4">
          Checkout securely
        </Link>
        {compact ? (
          <Link href="/cart" onClick={onNavigate} className="link mt-3 flex min-h-11 items-center justify-center text-sm">
            View bag
          </Link>
        ) : (
          <p className="mt-4 text-center text-xs text-taupe">Demo store: no payment is taken. 30-day returns · lifetime warranty.</p>
        )}
      </div>
    </div>
  );
}

function Line({ line: l, compact, onNavigate }: { line: CartLine; compact?: boolean; onNavigate?: () => void }) {
  const [engrave, setEngrave] = useState(!!l.engraving);
  const id = useId();
  // Rings and bands (anything with a size), builder rings, and the engravable tag/ID pieces.
  const canEngrave = !l.slug.startsWith("gift-card") && (l.variant.size !== undefined || !!l.custom || ENGRAVABLE_SLUGS.includes(l.slug));
  return (
    <li className="py-5">
      <div className="flex gap-4">
        <Link href={l.slug.startsWith("gift-card") ? "/gift-cards" : l.custom ? "/engagement/build" : `/product/${l.slug}`} onClick={onNavigate} className="relative block size-24 shrink-0 overflow-hidden rounded-lg bg-bone">
          <Image src={l.image} alt="" fill sizes="96px" quality={60} className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium leading-snug">{l.name}</p>
            <p className="shrink-0 text-sm">
              {formatPrice(l.unitPrice * l.qty)}
              {l.compareAt ? (
                <s className="ml-1.5 text-xs text-taupe">
                  <span className="sr-only">was </span>
                  {formatPrice(l.compareAt * l.qty)}
                </s>
              ) : null}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-taupe">{l.variantLabel}</p>
          {l.engraving && <p className="mt-0.5 text-xs text-gold-ink">Engraved: “{l.engraving}” (+{formatPrice(site.engravingPrice)})</p>}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center rounded-full border border-ink/15" role="group" aria-label={`Quantity of ${l.name}`}>
              <button type="button" onClick={() => cart.setQty(l.id, l.qty - 1)} disabled={l.qty <= 1} className="grid size-10 place-items-center disabled:opacity-35" aria-label="Decrease quantity">
                −
              </button>
              <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                {l.qty}
              </span>
              <button type="button" onClick={() => cart.setQty(l.id, l.qty + 1)} disabled={l.qty >= 9} className="grid size-10 place-items-center disabled:opacity-35" aria-label="Increase quantity">
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                cart.remove(l.id);
                ui.announce(`Removed ${l.name} from your bag`);
              }}
              className="link min-h-10 text-sm text-taupe"
            >
              Remove
            </button>
          </div>
          {canEngrave && (
            <div className="mt-3">
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={engrave}
                  onChange={(e) => {
                    setEngrave(e.target.checked);
                    if (!e.target.checked) cart.setEngraving(l.id, "");
                  }}
                  className="size-4 accent-[var(--color-ink)]"
                />
                Add hand engraving (+{formatPrice(site.engravingPrice)})
              </label>
              {engrave && (
                <div className={clsx("mt-2 rounded-xl bg-bone p-3", compact ? "" : "max-w-md")}>
                  <EngravingPreview text={l.engraving ?? ""} tone={metalTone[l.variant.metal]} />
                  <label htmlFor={id} className="sr-only">
                    Engraving text
                  </label>
                  <input
                    id={id}
                    className="field mt-2"
                    maxLength={18}
                    placeholder="e.g. A & L · 10.05.26"
                    defaultValue={l.engraving ?? ""}
                    onChange={(e) => cart.setEngraving(l.id, e.target.value.slice(0, 18))}
                  />
                  <p className="mt-1 text-xs text-taupe">Up to 18 characters, cut by hand inside the band.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function GiftOptions({ state }: { state: CartState }) {
  const id = useId();
  return (
    <div className="mt-2 rounded-xl border border-ink/10 p-4">
      <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input type="checkbox" checked={state.extras.giftBox} onChange={(e) => cart.setExtras({ giftBox: e.target.checked })} className="size-4 accent-[var(--color-ink)]" />
        Oak gift box &amp; handwritten note <span className="font-normal text-taupe">(free)</span>
      </label>
      {state.extras.giftBox && (
        <div className="mt-2">
          <label htmlFor={id} className="text-xs text-taupe">
            Your note (we&apos;ll write it by hand)
          </label>
          <textarea
            id={id}
            rows={2}
            maxLength={200}
            className="field mt-1 min-h-0 resize-none text-sm"
            defaultValue={state.extras.giftNote}
            onChange={(e) => cart.setExtras({ giftNote: e.target.value })}
            placeholder="Happy anniversary, love. Ten more."
          />
        </div>
      )}
    </div>
  );
}

function Promo({ code }: { code?: string }) {
  const [value, setValue] = useState(code ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(code && isPromoValid(code) ? { ok: true, text: `${site.promo.code} applied: ${site.promo.percent}% off` } : null);
  const id = useId();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return setMsg({ ok: false, text: "Enter a code first." });
        if (isPromoValid(value)) {
          cart.setExtras({ promo: value.trim().toUpperCase() });
          setMsg({ ok: true, text: `${site.promo.code} applied: ${site.promo.percent}% off` });
        } else {
          cart.setExtras({ promo: undefined });
          setMsg({ ok: false, text: `“${value.trim()}” isn't a code we recognise. Try ${site.promo.code}.` });
        }
      }}
    >
      <label htmlFor={id} className="text-sm font-medium">
        Promo code
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={id}
          className="field min-h-11 uppercase placeholder:normal-case"
          placeholder="WELCOME10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={msg ? !msg.ok : undefined}
          aria-describedby={msg ? `${id}-msg` : undefined}
        />
        <button type="submit" className="btn btn-ghost min-h-11 shrink-0 px-5">
          Apply
        </button>
      </div>
      {msg && (
        <p id={`${id}-msg`} role="status" className={clsx("mt-1.5 text-sm", msg.ok ? "text-gold-ink" : "text-error")}>
          {msg.text}
          {msg.ok && (
            <button
              type="button"
              className="link-under ml-2 text-taupe"
              onClick={() => {
                cart.setExtras({ promo: undefined });
                setValue("");
                setMsg(null);
              }}
            >
              Remove
            </button>
          )}
        </p>
      )}
    </form>
  );
}

function CrossSells({ exclude }: { exclude: string[] }) {
  const catalog = useCatalog(true);
  if (!catalog) return null;
  const picks = catalog.filter((c) => c.collections.includes("gift-edit") || c.price < 500).filter((c) => !exclude.includes(c.slug) && !c.soldOut).slice(0, 3);
  if (!picks.length) return null;
  return (
    <div className="mt-6 pb-4">
      <p className="eyebrow text-taupe">Pairs beautifully</p>
      <ul className="mt-3 space-y-3">
        {picks.map((c) => {
          const v = defaultVariant(c);
          const needsSize = !!c.ringSizes;
          const { price } = variantPrice(asPriceInput(c), v);
          return (
            <li key={c.slug} className="flex items-center gap-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-bone">
                <Image src={c.tones.yellow.src} alt="" fill sizes="64px" quality={60} className="object-cover" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-taupe">{formatPrice(price)}</p>
              </div>
              {needsSize ? (
                <button type="button" onClick={() => ui.openQuickView(c.slug)} className="btn btn-ghost min-h-10 px-4 text-[0.7rem]">
                  Choose
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    const li = (e.currentTarget.closest("li") as HTMLElement)?.querySelector<HTMLElement>("span");
                    addToCart(
                      { id: `${c.slug}|${variantKey(v)}`, slug: c.slug, name: c.name, image: c.tones.yellow.src, variant: v, variantLabel: variantLabel(v), unitPrice: price, qty: 1 },
                      li,
                      { openDrawer: false },
                    );
                  }}
                  className="btn btn-ghost min-h-10 px-4 text-[0.7rem]"
                  aria-label={`Add ${c.name} to bag`}
                >
                  Add
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyBag({ compact, onNavigate, removed }: { compact?: boolean; onNavigate?: () => void; removed: CartState["removed"] }) {
  return (
    <div className={clsx("text-center", compact ? "flex flex-1 flex-col items-center justify-center px-8" : "py-10")}>
      <svg viewBox="0 0 80 80" className="mx-auto size-20 text-gold-ink" aria-hidden>
        <circle cx="36" cy="44" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M58 6c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z" fill="var(--color-gold)" />
      </svg>
      <p className="mt-6 font-display text-3xl">Your bag is empty, for now.</p>
      <p className="mx-auto mt-2 max-w-xs text-taupe">Start with something everyday, or let us help with the big one.</p>
      {removed && (
        <button type="button" onClick={cart.undo} className="link-under mt-3 min-h-11 text-sm font-semibold">
          Undo removing {removed.line.name}
        </button>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/collections/bestsellers" onClick={onNavigate} className="btn btn-ink">
          Shop bestsellers
        </Link>
        <Link href="/engagement" onClick={onNavigate} className="btn btn-ghost">
          Engagement rings
        </Link>
      </div>
      <Link href="/collections/gift-edit" onClick={onNavigate} className="link mt-4 inline-flex min-h-11 items-center text-sm text-taupe">
        Or browse gifts under $500 →
      </Link>
    </div>
  );
}
