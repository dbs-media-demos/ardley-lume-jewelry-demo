"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import { formatPrice } from "@/lib/commerce/pricing";
import { addToCart } from "@/lib/add-to-cart";
import { Mark } from "@/components/brand/Logo";

const AMOUNTS = [100, 250, 500, 1000];
const DESIGNS = [
  { id: "ink", name: "Ink", cls: "bg-[linear-gradient(135deg,#17231e,#0e1311)] text-ivory" },
  { id: "oxblood", name: "Oxblood", cls: "bg-[linear-gradient(135deg,#6a2a33,#3a171c)] text-ivory" },
  { id: "bone", name: "Bone", cls: "bg-[linear-gradient(135deg,#f8f4ec,#e4dccd)] text-ink" },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digital gift card builder with a live preview; adds the card to the bag. */
export function GiftCardForm({ giftImage }: { giftImage: string }) {
  const uid = useId();
  const [amount, setAmount] = useState(250);
  const [custom, setCustom] = useState("");
  const [design, setDesign] = useState(DESIGNS[0].id);
  const [f, setF] = useState({ to: "", email: "", from: "", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const preview = useRef<HTMLDivElement>(null);
  const value = custom ? Number(custom) : amount;
  const d = DESIGNS.find((x) => x.id === design)!;

  const add = () => {
    const e: Record<string, string> = {};
    if (!value || value < 50 || value > 5000) e.custom = "Choose an amount between $50 and $5,000.";
    if (!f.to.trim()) e.to = "Who is it for?";
    if (!EMAIL.test(f.email.trim())) e.email = "Enter the recipient's email.";
    if (!f.from.trim()) e.from = "Add your name so they know who it's from.";
    setErr(e);
    if (Object.keys(e).length) {
      document.getElementById(`${uid}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    addToCart(
      {
        id: `gift-card|${value}|${design}|${f.email}|${Date.now()}`,
        slug: `gift-card-${value}`,
        name: `Gift card · ${formatPrice(value)}`,
        image: giftImage,
        variant: { metal: "14k-yellow" },
        variantLabel: `${d.name} design · to ${f.to.trim()} (${f.email.trim()}) · from ${f.from.trim()}`,
        unitPrice: value,
        qty: 1,
      },
      preview.current,
    );
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div ref={preview} className={clsx("relative aspect-[1.586] overflow-hidden rounded-3xl p-7 shadow-[0_40px_80px_-40px_rgba(14,19,17,0.6)] transition-colors duration-700", d.cls)}>
          <div className="flex items-start justify-between">
            <Mark className="size-10" />
            <p className="spec opacity-75">Gift card</p>
          </div>
          <p className="absolute bottom-7 left-7 font-display text-6xl">{formatPrice(value || 0)}</p>
          <div className="absolute right-7 bottom-8 text-right text-sm opacity-85">
            <p>For {f.to || "someone lovely"}</p>
            <p>From {f.from || "you"}</p>
          </div>
          <span aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full border-[18px] border-gold/25" />
          <span aria-hidden className="glint pointer-events-none absolute inset-0" data-glint="on" key={design + value} />
        </div>
        {f.message && <p className="mt-4 rounded-2xl bg-bone p-4 text-sm italic text-taupe">“{f.message}”</p>}
        <p className="mt-4 text-sm text-taupe">Delivered by email with your note. Never expires; use it online or in the showroom.</p>
      </div>

      <div className="space-y-8">
        <fieldset>
          <legend className="text-sm font-semibold">Amount</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((a) => (
              <label key={a} className="chip">
                <input type="radio" name="amount" className="sr-only" checked={!custom && amount === a} onChange={() => (setAmount(a), setCustom(""))} />
                {formatPrice(a)}
              </label>
            ))}
          </div>
          <div className="mt-3 max-w-xs">
            <label htmlFor={`${uid}-custom`} className="text-sm text-taupe">
              Or a custom amount ($50–$5,000)
            </label>
            <input
              id={`${uid}-custom`}
              inputMode="numeric"
              className="field mt-1.5"
              value={custom}
              placeholder="e.g. 750"
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-invalid={!!err.custom}
            />
            {err.custom && <p className="mt-1 text-sm text-error">{err.custom}</p>}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">Design</legend>
          <div className="mt-3 flex gap-3">
            {DESIGNS.map((x) => (
              <label key={x.id} className="flex cursor-pointer flex-col items-center gap-2 text-sm">
                <input type="radio" name="design" className="peer sr-only" checked={design === x.id} onChange={() => setDesign(x.id)} />
                <span className={clsx("block h-12 w-20 rounded-lg ring-2 ring-offset-2 ring-offset-ivory peer-focus-visible:outline-2 peer-focus-visible:outline-gold-ink", x.cls, design === x.id ? "ring-ink" : "ring-transparent")} />
                {x.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["to", "Recipient's name", "text"],
              ["email", "Recipient's email", "email"],
              ["from", "Your name", "text"],
            ] as const
          ).map(([k, label, type]) => (
            <div key={k} className={k === "from" ? "sm:col-span-2" : ""}>
              <label htmlFor={`${uid}-${k}`} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={`${uid}-${k}`}
                type={type}
                className="field mt-1.5"
                value={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
                aria-invalid={!!err[k]}
                aria-describedby={err[k] ? `${uid}-${k}-err` : undefined}
              />
              {err[k] && (
                <p id={`${uid}-${k}-err`} className="mt-1 text-sm text-error">
                  {err[k]}
                </p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-message`} className="text-sm font-medium">
              Message (optional)
            </label>
            <textarea id={`${uid}-message`} rows={3} maxLength={240} className="field mt-1.5" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          </div>
        </div>
        <button type="button" onClick={add} className="btn btn-ink w-full py-4">
          Add gift card · {formatPrice(value || 0)}
        </button>
      </div>
    </div>
  );
}
