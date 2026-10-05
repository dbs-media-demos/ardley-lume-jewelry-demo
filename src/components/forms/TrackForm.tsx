"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { mockCheckout } from "@/lib/commerce/mock-checkout";
import type { TrackResult } from "@/lib/commerce/provider";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Order number + email → an animated status timeline (mock data). */
export function TrackForm() {
  const uid = useId();
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Prefill from /track?order=AL-12345 (the success page links here) and the last order's email.
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get("order");
    let e = "";
    try {
      e = JSON.parse(sessionStorage.getItem("al-last-order") ?? "{}").email ?? "";
    } catch {}
    const id = window.requestAnimationFrame(() => {
      if (o) setOrder(o);
      if (e) setEmail(e);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const submit = async () => {
    const x: Record<string, string> = {};
    if (!/^AL-?\d{4,6}$/i.test(order.trim())) x.order = "Order numbers look like AL-48213 (it's in your receipt).";
    if (!EMAIL.test(email.trim())) x.email = "Enter the email you ordered with.";
    setErr(x);
    if (Object.keys(x).length) return;
    setLoading(true);
    setNotFound(false);
    const r = await mockCheckout.trackOrder(order, email);
    setLoading(false);
    if (!r) setNotFound(true);
    setResult(r ?? null);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
      <form
        noValidate
        className="space-y-4 self-start rounded-2xl bg-bone p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <label htmlFor={`${uid}-order`} className="text-sm font-medium">
            Order number
          </label>
          <input id={`${uid}-order`} className="field mt-1.5 uppercase placeholder:normal-case" placeholder="AL-48213" value={order} onChange={(e) => setOrder(e.target.value)} aria-invalid={!!err.order} aria-describedby={err.order ? `${uid}-order-err` : undefined} />
          {err.order && (
            <p id={`${uid}-order-err`} className="mt-1 text-sm text-error">
              {err.order}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="text-sm font-medium">
            Email
          </label>
          <input id={`${uid}-email`} type="email" autoComplete="email" className="field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err.email} aria-describedby={err.email ? `${uid}-email-err` : undefined} />
          {err.email && (
            <p id={`${uid}-email-err`} className="mt-1 text-sm text-error">
              {err.email}
            </p>
          )}
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-ink w-full">
          {loading ? "Finding your order…" : "Track order"}
        </button>
        <p className="text-xs text-taupe">Demo: any order number like AL-12345 and any email will show a sample timeline.</p>
      </form>

      <div aria-live="polite">
        {notFound && <p className="rounded-2xl border border-ink/10 p-6 text-taupe">We couldn&apos;t find that order. Check the number in your receipt, or call us.</p>}
        {result && (
          <div key={result.number}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="spec text-taupe">Order {result.number}</p>
                <p className="mt-1 font-display text-4xl">{result.status}</p>
              </div>
              <p className="text-right text-sm">
                <span className="block text-taupe">Expected</span>
                <span className="font-display text-2xl">{result.eta}</span>
              </p>
            </div>
            <p className="mt-1 text-sm text-taupe">{result.carrier}</p>
            <ol className="relative mt-8 space-y-6 pl-10">
              <span aria-hidden className="absolute top-2 bottom-2 left-[0.9rem] w-px bg-ink/10">
                <span className="block w-px origin-top bg-gold-ink [animation:track-line_1.6s_var(--ease-out-expo)_0.2s_both]" style={{ height: `${(result.steps.filter((s) => s.done).length - 1) * (100 / (result.steps.length - 1))}%` }} />
              </span>
              {result.steps.map((s, i) => (
                <li key={s.label} className="relative [animation:fade-up_0.8s_var(--ease-out-expo)_both]" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
                  <span aria-hidden className={clsx("absolute top-0.5 -left-10 grid size-7 place-items-center rounded-full text-xs", s.done ? "bg-gold-ink text-ivory" : "border border-ink/20 bg-ivory text-taupe")}>
                    {s.done ? "✓" : i + 1}
                  </span>
                  <p className="font-medium">
                    {s.label} {s.at && <span className="font-normal text-taupe">· {s.at}</span>}
                  </p>
                  <p className="text-sm text-taupe">{s.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
        {!result && !notFound && (
          <div className="grid h-full min-h-60 place-items-center rounded-2xl border border-dashed border-ink/15 p-8 text-center text-taupe">
            <p>Your order&apos;s journey from our bench to your door will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
