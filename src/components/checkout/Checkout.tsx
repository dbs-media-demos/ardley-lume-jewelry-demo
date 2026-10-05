"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { cart, useCart } from "@/lib/store";
import { computeTotals, formatPrice, shippingMethods } from "@/lib/commerce/pricing";
import { mockCheckout } from "@/lib/commerce/mock-checkout";
import type { Address } from "@/lib/commerce/types";
import { US_STATES } from "@/content/states";
import { site } from "@/content/site";
import { Sheet } from "@/components/ui/Sheet";
import { brandLabel, detectBrand, formatCardNumber, formatExpiry, luhn, validExpiry } from "@/lib/card";
import { CardPreview } from "./CardPreview";

type Step = 1 | 2 | 3 | 4 | 5;
const STEP_NAMES = ["Contact", "Delivery", "Shipping", "Payment", "Review & pay"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, error, hint, children, className }: { id: string; label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-taupe">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const fieldProps = (id: string, error?: string, hint?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
});

export function Checkout() {
  const router = useRouter();
  const state = useCart();
  const uid = useId();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [news, setNews] = useState(false);
  const [mode, setMode] = useState<"ship" | "pickup">("ship");
  const [addr, setAddr] = useState<Address>({ firstName: "", lastName: "", line1: "", line2: "", city: "", state: "TX", zip: "", phone: "" });
  const [shippingId, setShippingId] = useState("standard");
  // Card fields live only in this component's memory and are wiped after "payment".
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [cvcFocus, setCvcFocus] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [express, setExpress] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  // Typing into a field clears its error straight away.
  const clearErr = (k: string) =>
    setErrors((e) => {
      if (!e[k]) return e;
      const rest = { ...e };
      delete rest[k];
      return rest;
    });
  const methodId = mode === "pickup" ? "pickup" : shippingId;
  const taxState = mode === "pickup" ? "TX" : step >= 3 ? addr.state : undefined;
  const totals = computeTotals(state.lines, state.extras, { shippingId: methodId, state: taxState });
  const brand = detectBrand(card.number);

  const fail = (e: Record<string, string>) => {
    setErrors(e);
    requestAnimationFrame(() => {
      const first = Object.keys(e)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
    });
    return false;
  };

  const validate = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!EMAIL.test(email.trim())) e.email = "Enter an email like name@example.com so we can send your receipt.";
    }
    if (s === 2) {
      if (!addr.firstName.trim()) e.firstName = "First name is required.";
      if (!addr.lastName.trim()) e.lastName = "Last name is required.";
      if (mode === "ship") {
        if (addr.line1.trim().length < 4) e.line1 = "Enter a street address.";
        if (!addr.city.trim()) e.city = "Enter a city.";
        if (!/^\d{5}(-\d{4})?$/.test(addr.zip.trim())) e.zip = "ZIP codes have 5 digits.";
      }
      if (addr.phone && addr.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number, or leave it blank.";
    }
    if (s === 4) {
      const digits = card.number.replace(/\D/g, "");
      if (!digits) e.number = "Enter a card number. For the demo, use 4242 4242 4242 4242.";
      else if (brand === "unknown") e.number = "We accept Visa, Mastercard and American Express.";
      else if (!luhn(digits) || digits.length < (brand === "amex" ? 15 : 16)) e.number = "That card number doesn't look right. Check the digits.";
      if (card.name.trim().length < 2) e.name = "Enter the name as it appears on the card.";
      const exp = validExpiry(card.exp);
      if (exp) e.exp = exp;
      if (!new RegExp(`^\\d{${brand === "amex" ? 4 : 3}}$`).test(card.cvc)) e.cvc = brand === "amex" ? "Amex security codes have 4 digits." : "The security code is the 3 digits on the back.";
    }
    if (Object.keys(e).length) return fail(e);
    setErrors({});
    return true;
  };

  const next = (s: Step) => {
    if (!validate(s)) return;
    let n = (s + 1) as Step;
    if (n === 3 && mode === "pickup") n = 4;
    setStep(n);
    requestAnimationFrame(() => document.getElementById(`${uid}-step-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const pay = async () => {
    for (const s of [1, 2, 4] as Step[]) {
      if (!validate(s)) {
        setStep(s);
        return;
      }
    }
    setPaying(true);
    const { checkoutId } = await mockCheckout.createCheckout(state.lines, state.extras);
    const order = await mockCheckout.placeOrder({
      checkoutId,
      email: email.trim(),
      lines: state.lines,
      extras: state.extras,
      address: mode === "ship" ? addr : { ...addr, line1: "Pickup · Knox-Henderson showroom", city: "Dallas", state: "TX", zip: "75206" },
      pickup: mode === "pickup",
      shippingId: methodId,
      state: taxState,
      // Only display data leaves the form: brand + last four.
      paymentToken: { brand: brandLabel[brand], last4: card.number.replace(/\D/g, "").slice(-4) },
    });
    setCard({ number: "", name: "", exp: "", cvc: "" });
    try {
      sessionStorage.setItem("al-last-order", JSON.stringify(order));
    } catch {}
    cart.clear();
    router.push("/checkout/success");
  };

  if (!state.lines.length && !paying) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-display text-4xl">Your bag is empty.</p>
        <p className="mt-3 text-taupe">Add something you love and come back. Checkout takes about a minute.</p>
        <Link href="/shop" className="btn btn-ink mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  const summary = <Summary totals={totals} lines={state.lines} giftNote={state.extras.giftBox ? state.extras.giftNote : ""} methodId={methodId} taxKnown={!!taxState} />;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      {/* mobile summary */}
      <div className="lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-bone px-4 text-sm font-medium">
          <span>{summaryOpen ? "Hide" : "Show"} order summary</span>
          <span className="font-semibold">{formatPrice(totals.total, { cents: true })}</span>
        </button>
        <div className={clsx("grid transition-[grid-template-rows] duration-500", summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden" inert={!summaryOpen}>
            <div className="pt-4">{summary}</div>
          </div>
        </div>
      </div>

      <div>
        {/* Express */}
        <div className="rounded-2xl border border-ink/10 p-5">
          <p className="text-center text-sm text-taupe">Express checkout</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { id: "Apple Pay", cls: "bg-ink text-ivory", label: " Pay" },
              { id: "Google Pay", cls: "border border-ink/20 bg-white text-ink", label: "G Pay" },
              { id: "PayPal", cls: "bg-[#ffc439] text-[#003087]", label: "PayPal" },
            ].map((x) => (
              <button key={x.id} type="button" onClick={() => setExpress(x.id)} className={clsx("min-h-12 rounded-lg text-[0.95rem] font-semibold", x.cls)} aria-label={`Pay with ${x.id}`}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <p className="my-6 flex items-center gap-4 text-xs tracking-[0.2em] text-taupe uppercase">
          <span className="h-px flex-1 bg-ink/15" />
          or pay by card
          <span className="h-px flex-1 bg-ink/15" />
        </p>

        {Object.keys(errors).length > 0 && (
          <div ref={errorSummary} role="alert" className="mb-5 rounded-xl border border-error/40 bg-error/5 px-4 py-3 text-sm text-error">
            Please fix {Object.keys(errors).length === 1 ? "the highlighted field" : `the ${Object.keys(errors).length} highlighted fields`} to continue.
          </div>
        )}

        <ol className="space-y-3">
          {/* 1. Contact */}
          <StepShell n={1} step={step} id={`${uid}-step-1`} summary={email} onEdit={() => setStep(1)}>
            <Field id={`${uid}-email`} label="Email" error={errors.email} hint="For your receipt and delivery updates.">
              <input
                {...fieldProps(`${uid}-email`, errors.email, "For your receipt and delivery updates.")}
                type="email"
                autoComplete="email"
                inputMode="email"
                className="field"
                value={email}
                onChange={(e) => (setEmail(e.target.value), clearErr("email"))}
              />
            </Field>
            <label className="mt-3 flex min-h-10 items-center gap-2.5 text-sm">
              <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="size-4 accent-[var(--color-ink)]" />
              Email me about new pieces and private sales (once a month)
            </label>
            <button type="button" onClick={() => next(1)} className="btn btn-ink mt-5 w-full sm:w-auto">
              Continue to delivery
            </button>
          </StepShell>

          {/* 2. Delivery */}
          <StepShell
            n={2}
            step={step}
            id={`${uid}-step-2`}
            summary={mode === "pickup" ? `Pick up in Dallas · ${addr.firstName} ${addr.lastName}` : `${addr.firstName} ${addr.lastName}, ${addr.line1}, ${addr.city}, ${addr.state} ${addr.zip}`}
            onEdit={() => setStep(2)}
          >
            <fieldset>
              <legend className="sr-only">Delivery method</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["ship", "pickup"] as const).map((m) => (
                  <label key={m} className={clsx("flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border px-4 py-2 text-sm", mode === m ? "border-ink bg-bone" : "border-ink/15")}>
                    <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                    <span className="font-medium">{m === "ship" ? "Ship it (insured)" : "Pick up in Dallas"}</span>
                    <span className="text-xs text-taupe">{m === "ship" ? "Anywhere in the US" : "Knox-Henderson showroom · free"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field id={`${uid}-firstName`} label="First name" error={errors.firstName}>
                <input {...fieldProps(`${uid}-firstName`, errors.firstName)} autoComplete="given-name" className="field" value={addr.firstName} onChange={(e) => (setAddr({ ...addr, firstName: e.target.value }), clearErr("firstName"))} />
              </Field>
              <Field id={`${uid}-lastName`} label="Last name" error={errors.lastName}>
                <input {...fieldProps(`${uid}-lastName`, errors.lastName)} autoComplete="family-name" className="field" value={addr.lastName} onChange={(e) => (setAddr({ ...addr, lastName: e.target.value }), clearErr("lastName"))} />
              </Field>
              {mode === "ship" && (
                <>
                  <Field id={`${uid}-line1`} label="Street address" error={errors.line1} className="col-span-2">
                    <input {...fieldProps(`${uid}-line1`, errors.line1)} autoComplete="address-line1" className="field" value={addr.line1} onChange={(e) => (setAddr({ ...addr, line1: e.target.value }), clearErr("line1"))} />
                  </Field>
                  <Field id={`${uid}-line2`} label="Apartment, suite (optional)" className="col-span-2">
                    <input id={`${uid}-line2`} autoComplete="address-line2" className="field" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                  </Field>
                  <Field id={`${uid}-city`} label="City" error={errors.city} className="col-span-2 sm:col-span-1">
                    <input {...fieldProps(`${uid}-city`, errors.city)} autoComplete="address-level2" className="field" value={addr.city} onChange={(e) => (setAddr({ ...addr, city: e.target.value }), clearErr("city"))} />
                  </Field>
                  <Field id={`${uid}-state`} label="State">
                    <select id={`${uid}-state`} autoComplete="address-level1" className="field" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })}>
                      {US_STATES.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id={`${uid}-zip`} label="ZIP code" error={errors.zip}>
                    <input {...fieldProps(`${uid}-zip`, errors.zip)} autoComplete="postal-code" inputMode="numeric" className="field" value={addr.zip} onChange={(e) => (setAddr({ ...addr, zip: e.target.value }), clearErr("zip"))} />
                  </Field>
                </>
              )}
              <Field id={`${uid}-phone`} label="Phone (optional)" error={errors.phone} hint="Only for the courier, if they need you." className="col-span-2 sm:col-span-1">
                <input {...fieldProps(`${uid}-phone`, errors.phone, "Only for the courier, if they need you.")} type="tel" autoComplete="tel" inputMode="tel" className="field" value={addr.phone} onChange={(e) => (setAddr({ ...addr, phone: e.target.value }), clearErr("phone"))} />
              </Field>
            </div>
            <button type="button" onClick={() => next(2)} className="btn btn-ink mt-5 w-full sm:w-auto">
              {mode === "pickup" ? "Continue to payment" : "Continue to shipping"}
            </button>
          </StepShell>

          {/* 3. Shipping */}
          <StepShell n={3} step={step} id={`${uid}-step-3`} summary={mode === "pickup" ? "Showroom pickup" : shippingMethods.find((m) => m.id === shippingId)?.name ?? ""} onEdit={() => mode === "ship" && setStep(3)} skipped={mode === "pickup"}>
            <fieldset>
              <legend className="sr-only">Shipping method</legend>
              <div className="space-y-2">
                {shippingMethods
                  .filter((m) => m.id !== "pickup")
                  .map((m) => {
                    const price = computeTotals(state.lines, state.extras, { shippingId: m.id }).shipping;
                    return (
                      <label key={m.id} className={clsx("flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3", shippingId === m.id ? "border-ink bg-bone" : "border-ink/15")}>
                        <span className="flex items-center gap-3">
                          <input type="radio" name="ship" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} className="size-4 accent-[var(--color-ink)]" />
                          <span>
                            <span className="block text-sm font-medium">{m.name}</span>
                            <span className="block text-xs text-taupe">
                              {m.days[0] === m.days[1] ? `${m.days[0]} business day${m.days[0] > 1 ? "s" : ""}` : `${m.days[0]}–${m.days[1]} business days`} · {m.note}
                            </span>
                          </span>
                        </span>
                        <span className="text-sm font-medium">{price === 0 ? "Free" : formatPrice(price)}</span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
            <button type="button" onClick={() => next(3)} className="btn btn-ink mt-5 w-full sm:w-auto">
              Continue to payment
            </button>
          </StepShell>

          {/* 4. Payment */}
          <StepShell n={4} step={step} id={`${uid}-step-4`} summary={card.number ? `${brandLabel[brand]} ending ${card.number.replace(/\D/g, "").slice(-4)}` : ""} onEdit={() => setStep(4)}>
            <div className="grid gap-6 md:grid-cols-[1fr_15rem]">
              <div className="grid grid-cols-2 gap-4">
                <Field id={`${uid}-number`} label="Card number" error={errors.number} className="col-span-2">
                  <div className="relative">
                    <input
                      {...fieldProps(`${uid}-number`, errors.number)}
                      autoComplete="cc-number"
                      inputMode="numeric"
                      className="field pr-28 tracking-wider"
                      placeholder="1234 1234 1234 1234"
                      value={card.number}
                      onChange={(e) => (setCard({ ...card, number: formatCardNumber(e.target.value) }), clearErr("number"))}
                    />
                    <span className="spec pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-taupe">{brand !== "unknown" ? brandLabel[brand] : "Visa · MC · Amex"}</span>
                  </div>
                </Field>
                <Field id={`${uid}-name`} label="Name on card" error={errors.name} className="col-span-2">
                  <input {...fieldProps(`${uid}-name`, errors.name)} autoComplete="cc-name" className="field" value={card.name} onChange={(e) => (setCard({ ...card, name: e.target.value }), clearErr("name"))} />
                </Field>
                <Field id={`${uid}-exp`} label="Expiry (MM / YY)" error={errors.exp}>
                  <input {...fieldProps(`${uid}-exp`, errors.exp)} autoComplete="cc-exp" inputMode="numeric" placeholder="MM / YY" className="field" value={card.exp} onChange={(e) => (setCard({ ...card, exp: formatExpiry(e.target.value) }), clearErr("exp"))} />
                </Field>
                <Field id={`${uid}-cvc`} label="Security code" error={errors.cvc}>
                  <input
                    {...fieldProps(`${uid}-cvc`, errors.cvc)}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    placeholder={brand === "amex" ? "4 digits" : "3 digits"}
                    className="field"
                    value={card.cvc}
                    onFocus={() => setCvcFocus(true)}
                    onBlur={() => setCvcFocus(false)}
                    onChange={(e) => (setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 3) }), clearErr("cvc"))}
                  />
                </Field>
                <p className="col-span-2 text-xs text-taupe">
                  Demo: use <button type="button" className="link-under font-medium text-ink" onClick={() => setCard({ number: "4242 4242 4242 4242", name: card.name || `${addr.firstName} ${addr.lastName}`.trim(), exp: "12 / 29", cvc: "123" })}>4242 4242 4242 4242</button>, any future date and any 3 digits. This form is a design only: nothing you type leaves your browser.
                </p>
              </div>
              <CardPreview number={card.number} name={card.name} exp={card.exp} brand={brand} flipped={cvcFocus} cvc={card.cvc} />
            </div>
            <button type="button" onClick={() => next(4)} className="btn btn-ink mt-6 w-full sm:w-auto">
              Review order
            </button>
          </StepShell>

          {/* 5. Review */}
          <StepShell n={5} step={step} id={`${uid}-step-5`} summary="" onEdit={() => setStep(5)}>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="spec text-taupe">Contact</dt>
                <dd className="mt-1">{email}</dd>
              </div>
              <div>
                <dt className="spec text-taupe">{mode === "pickup" ? "Pickup" : "Ship to"}</dt>
                <dd className="mt-1">
                  {addr.firstName} {addr.lastName}
                  <br />
                  {mode === "pickup" ? "Knox-Henderson showroom, ready in 1–2 days" : `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}, ${addr.city}, ${addr.state} ${addr.zip}`}
                </dd>
              </div>
              <div>
                <dt className="spec text-taupe">Method</dt>
                <dd className="mt-1">{shippingMethods.find((m) => m.id === methodId)?.name}</dd>
              </div>
              <div>
                <dt className="spec text-taupe">Payment</dt>
                <dd className="mt-1">
                  {brandLabel[brand]} ending {card.number.replace(/\D/g, "").slice(-4) || "····"}
                </dd>
              </div>
            </dl>
            <button type="button" onClick={pay} disabled={paying} aria-busy={paying} className="btn btn-gold mt-6 w-full py-4 text-[0.9rem]">
              {paying ? (
                <>
                  <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                  Authorising…
                </>
              ) : (
                `Pay ${formatPrice(totals.total, { cents: true })}`
              )}
            </button>
            <p className="mt-3 text-center text-xs text-taupe">By paying you agree to our <Link href="/terms" className="link-under">terms</Link>. Demo store: no payment is taken.</p>
          </StepShell>
        </ol>
      </div>

      <aside className="hidden lg:block" aria-label="Order summary">
        <div className="sticky top-24">{summary}</div>
      </aside>

      <Sheet open={!!express} onClose={() => setExpress(null)} label="Express pay is disabled" side="center" className="md:w-[min(28rem,92vw)]">
        <div className="p-8 text-center">
          <p className="eyebrow text-gold-ink">{express}</p>
          <p className="mt-3 font-display text-3xl">Demo store: express pay is disabled.</p>
          <p className="mt-3 text-taupe">In the live store this opens {express} with your saved card and address. For the demo, please use the card form with the test card 4242 4242 4242 4242.</p>
          <button type="button" onClick={() => setExpress(null)} className="btn btn-ink mt-6" data-autofocus>
            Use the card form
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function StepShell({ n, step, id, summary, onEdit, children, skipped }: { n: Step; step: Step; id: string; summary: string; onEdit: () => void; children: ReactNode; skipped?: boolean }) {
  const open = step === n;
  const done = step > n;
  return (
    <li id={id} className={clsx("scroll-mt-28 rounded-2xl border transition-colors duration-500", open ? "border-ink/25 bg-white/60" : "border-ink/10")}>
      <div className="flex min-h-16 items-center justify-between gap-4 px-5">
        <h2 className="flex items-center gap-3 font-sans text-base font-semibold tracking-normal">
          <span aria-hidden className={clsx("grid size-7 place-items-center rounded-full text-xs", done ? "bg-gold-ink text-ivory" : open ? "bg-ink text-ivory" : "bg-ink/10 text-taupe")}>
            {done ? "✓" : n}
          </span>
          {STEP_NAMES[n - 1]}
          {skipped && <span className="text-sm font-normal text-taupe">· not needed for pickup</span>}
        </h2>
        {done && !skipped && (
          <button type="button" onClick={onEdit} className="link-under min-h-11 text-sm text-taupe" aria-label={`Edit ${STEP_NAMES[n - 1]}`}>
            Edit
          </button>
        )}
      </div>
      {done && summary && !open && <p className="-mt-2 truncate px-5 pb-4 pl-15 text-sm text-taupe">{summary}</p>}
      <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <div className={clsx("px-5 pb-6 transition-[opacity,transform] duration-500", open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0")}>{children}</div>
        </div>
      </div>
    </li>
  );
}

function Summary({
  totals,
  lines,
  giftNote,
  methodId,
  taxKnown,
}: {
  totals: ReturnType<typeof computeTotals>;
  lines: ReturnType<typeof useCart>["lines"];
  giftNote: string;
  methodId: string;
  taxKnown: boolean;
}) {
  return (
    <div className="rounded-2xl bg-bone p-6">
      <ul className="space-y-4">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-4">
            <span className="relative size-16 shrink-0 rounded-lg bg-ivory">
              <Image src={l.image} alt="" fill sizes="64px" quality={60} className="rounded-lg object-cover" />
              <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-ink text-[0.65rem] text-ivory" aria-label={`Quantity ${l.qty}`}>
                {l.qty}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-medium">{l.name}</span>
              <span className="block text-xs text-taupe">{l.variantLabel}</span>
              {l.engraving && <span className="block text-xs text-gold-ink">Engraved “{l.engraving}”</span>}
            </span>
            <span className="text-sm">{formatPrice(l.unitPrice * l.qty)}</span>
          </li>
        ))}
      </ul>
      {giftNote && <p className="mt-4 rounded-lg bg-ivory px-3 py-2 text-xs text-taupe">Gift note: “{giftNote}”</p>}
      <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-gold-ink">
            <dt>Promo {site.promo.code}</dt>
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
          <dt>{methodId === "pickup" ? "Showroom pickup" : "Insured shipping"}</dt>
          <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Sales tax {taxKnown ? "(est.)" : ""}</dt>
          <dd>{taxKnown ? formatPrice(totals.tax, { cents: true }) : "After address"}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-3xl">{formatPrice(totals.total, { cents: true })}</dd>
        </div>
      </dl>
      <ul className="mt-5 space-y-1 text-xs text-taupe">
        <li>✦ Insured to full value, signature on delivery</li>
        <li>✦ 30-day returns · free resizing for 60 days</li>
        <li>✦ Lifetime warranty and free cleaning</li>
      </ul>
    </div>
  );
}
