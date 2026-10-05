"use client";

import Image from "next/image";
import { useId, useState } from "react";
import clsx from "clsx";
import type { CardImg } from "@/lib/card-types";

const PIECES = ["Engagement ring", "Wedding band(s)", "Earrings", "Necklace or pendant", "Redesign an heirloom", "Something else"];
const BUDGETS = ["$1,500–3,000", "$3,000–6,000", "$6,000–12,000", "$12,000+", "Not sure yet"];
const TIMELINES = ["No rush", "Within 2 months", "Within 1 month", "A specific date"];
const STONES = ["Lab-grown diamond", "Natural diamond", "Coloured stone", "An heirloom stone", "No stone"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Mood = { key: string; label: string; img: CardImg };

/** Multi-step bespoke inquiry: piece → mood → budget → details → contact. Validates, sends nothing. */
export function BespokeForm({ moods }: { moods: Mood[] }) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ piece: "", moods: [] as string[], budget: "", timeline: "", date: "", stone: "", details: "", name: "", email: "", phone: "", contact: "Email" });
  const [err, setErr] = useState<Record<string, string>>({});
  const steps = ["The piece", "The mood", "Budget & timing", "Details", "You"];

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !data.piece) e.piece = "Choose what we're making.";
    if (step === 1 && !data.moods.length) e.moods = "Pick at least one image that feels right.";
    if (step === 2 && !data.budget) e.budget = "Choose a budget range; it helps us suggest the right stones.";
    if (step === 2 && data.timeline === "A specific date" && !data.date) e.date = "Add the date you have in mind.";
    if (step === 3 && data.details.trim().length < 10) e.details = "Tell us a little more (a sentence or two is perfect).";
    if (step === 4) {
      if (!data.name.trim()) e.name = "Please add your name.";
      if (!EMAIL.test(data.email.trim())) e.email = "Enter a valid email so Margot can reply.";
    }
    setErr(e);
    return !Object.keys(e).length;
  };

  if (done)
    return (
      <div role="status" className="rounded-[2rem] bg-forest p-8 text-ivory md:p-12">
        <p className="eyebrow text-gold-pale">Inquiry received</p>
        <p className="mt-3 font-display text-4xl">Thank you, {data.name.split(" ")[0]}.</p>
        <p className="mt-4 max-w-lg text-ivory/85">
          Margot will reply within two business days with a few first thoughts and two or three sketch directions for your {data.piece.toLowerCase()}. (Demo: nothing was actually sent.)
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[data.budget, data.timeline, data.stone, ...data.moods].filter(Boolean).map((t) => (
            <li key={t} className="rounded-full border border-ivory/25 px-3 py-1">
              {t}
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <form
      noValidate
      className="rounded-[2rem] border border-ink/10 bg-ivory p-6 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        if (step < steps.length - 1) setStep(step + 1);
        else setDone(true);
      }}
    >
      <ol className="flex gap-1.5" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex-1">
            <span className={clsx("block h-1 rounded-full transition-colors duration-500", i <= step ? "bg-gold-ink" : "bg-ink/10")} />
            <span className={clsx("spec mt-2 hidden md:block", i === step ? "text-ink" : "text-taupe")} aria-current={i === step ? "step" : undefined}>
              {s}
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        Step {step + 1} of {steps.length}: {steps[step]}
      </p>

      <div key={step} className="mt-8 [animation:fade-up_0.6s_var(--ease-out-expo)_both]">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-3xl">What are we making?</legend>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {PIECES.map((p) => (
                <label key={p} className="chip justify-start rounded-xl py-3">
                  <input type="radio" name="piece" className="sr-only" checked={data.piece === p} onChange={() => setData({ ...data, piece: p })} />
                  {p}
                </label>
              ))}
            </div>
            {err.piece && <p className="mt-2 text-sm text-error">{err.piece}</p>}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-3xl">Which of these feel like you?</legend>
            <p className="mt-2 text-sm text-taupe">Pick up to three. There are no wrong answers; this is how Margot starts sketching.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {moods.map((m) => {
                const on = data.moods.includes(m.label);
                return (
                  <label key={m.key} className={clsx("group relative block cursor-pointer overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-ivory transition", on ? "ring-ink" : "ring-transparent")}>
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={on}
                      onChange={() =>
                        setData((d) => ({ ...d, moods: on ? d.moods.filter((x) => x !== m.label) : d.moods.length < 3 ? [...d.moods, m.label] : d.moods }))
                      }
                    />
                    <span className="relative block aspect-[3/4]">
                      <Image src={m.img.src} alt="" fill sizes="(min-width:768px) 18vw, 45vw" quality={60} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 pt-8 text-sm font-medium text-ivory">{m.label}</span>
                    {on && <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-ink text-xs text-ivory">✓</span>}
                    <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline-2 peer-focus-visible:outline-gold-ink" />
                  </label>
                );
              })}
            </div>
            {err.moods && <p className="mt-2 text-sm text-error">{err.moods}</p>}
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="font-display text-3xl">Budget</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <label key={b} className="chip">
                    <input type="radio" name="budget" className="sr-only" checked={data.budget === b} onChange={() => setData({ ...data, budget: b })} />
                    {b}
                  </label>
                ))}
              </div>
              {err.budget && <p className="mt-2 text-sm text-error">{err.budget}</p>}
            </fieldset>
            <fieldset>
              <legend className="font-display text-3xl">Timeline</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {TIMELINES.map((t) => (
                  <label key={t} className="chip">
                    <input type="radio" name="timeline" className="sr-only" checked={data.timeline === t} onChange={() => setData({ ...data, timeline: t })} />
                    {t}
                  </label>
                ))}
              </div>
              {data.timeline === "A specific date" && (
                <div className="mt-4 max-w-xs">
                  <label htmlFor={`${uid}-date`} className="text-sm font-medium">
                    The date
                  </label>
                  <input id={`${uid}-date`} type="date" className="field mt-1.5" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} aria-invalid={!!err.date} />
                  {err.date && <p className="mt-1 text-sm text-error">{err.date}</p>}
                </div>
              )}
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <fieldset>
              <legend className="font-display text-3xl">The stone</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {STONES.map((s) => (
                  <label key={s} className="chip">
                    <input type="radio" name="stone" className="sr-only" checked={data.stone === s} onChange={() => setData({ ...data, stone: s })} />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor={`${uid}-details`} className="font-display text-3xl">
                Tell us the story
              </label>
              <p className="mt-1 text-sm text-taupe">Who it&apos;s for, what they wear every day, anything you already know you love (or hate).</p>
              <textarea
                id={`${uid}-details`}
                rows={5}
                className="field mt-3"
                value={data.details}
                onChange={(e) => setData({ ...data, details: e.target.value })}
                aria-invalid={!!err.details}
                aria-describedby={err.details ? `${uid}-details-err` : undefined}
              />
              {err.details && (
                <p id={`${uid}-details-err`} className="mt-1 text-sm text-error">
                  {err.details}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <p className="font-display text-3xl sm:col-span-2">Where should Margot reply?</p>
            {(
              [
                ["name", "Your name", "text", "name"],
                ["email", "Email", "email", "email"],
                ["phone", "Phone (optional)", "tel", "tel"],
              ] as const
            ).map(([k, label, type, ac]) => (
              <div key={k}>
                <label htmlFor={`${uid}-${k}`} className="text-sm font-medium">
                  {label}
                </label>
                <input
                  id={`${uid}-${k}`}
                  type={type}
                  autoComplete={ac}
                  className="field mt-1.5"
                  value={data[k]}
                  onChange={(e) => setData({ ...data, [k]: e.target.value })}
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
            <fieldset>
              <legend className="text-sm font-medium">Best way to reach you</legend>
              <div className="mt-1.5 flex gap-2">
                {["Email", "Phone", "Video call"].map((c) => (
                  <label key={c} className="chip">
                    <input type="radio" name="contact" className="sr-only" checked={data.contact === c} onChange={() => setData({ ...data, contact: c })} />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <button type="button" onClick={() => (setErr({}), setStep(Math.max(0, step - 1)))} className={clsx("btn btn-ghost", step === 0 && "invisible")}>
          Back
        </button>
        <button type="submit" className="btn btn-ink">
          {step === steps.length - 1 ? "Send inquiry" : "Continue"}
        </button>
      </div>
    </form>
  );
}
