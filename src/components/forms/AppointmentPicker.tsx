"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { site } from "@/content/site";

const TYPES = [
  { id: "engagement", name: "Engagement consultation", mins: 60, note: "Compare stones, try settings, talk budget." },
  { id: "bands", name: "Wedding bands", mins: 45, note: "Fit bands to your ring, both of you welcome." },
  { id: "bespoke", name: "Bespoke design", mins: 60, note: "Sketch a one-off piece with Margot." },
  { id: "repair", name: "Resize, repair or clean", mins: 20, note: "Free assessment, written quote." },
  { id: "browse", name: "Just browsing", mins: 30, note: "A quiet half hour with the collection." },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const noop = () => () => {};

/** Booking UI: type → showroom or video → date (next 3 weeks, closed Mondays) → time → details. Sends nothing. */
export function AppointmentPicker() {
  const uid = useId();
  const today = useSyncExternalStore(noop, () => new Date().toDateString(), () => "");
  const [type, setType] = useState(TYPES[0].id);
  const [mode, setMode] = useState<"showroom" | "video">("showroom");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const days = useMemo(() => {
    if (!today) return [];
    const start = new Date(today);
    return Array.from({ length: 21 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i + 1);
      const h = site.hours.find((x) => x.day === d.getDay())!;
      return { iso: d.toISOString().slice(0, 10), d, open: !!h.open, h };
    });
  }, [today]);

  const slots = useMemo(() => {
    const day = days.find((x) => x.iso === date);
    if (!day || !day.open) return [];
    const [oh] = day.h.open!.split(":").map(Number);
    const [ch] = day.h.close!.split(":").map(Number);
    const out: { t: string; taken: boolean }[] = [];
    for (let h = oh; h < ch; h++) {
      for (const m of [0, 30]) {
        const label = `${h % 12 || 12}:${m ? "30" : "00"} ${h >= 12 ? "pm" : "am"}`;
        // Deterministic "already booked" slots so the calendar looks real.
        const taken = (day.d.getDate() * 7 + h * 3 + m) % 5 === 0;
        out.push({ t: label, taken });
      }
    }
    return out;
  }, [date, days]);

  const t = TYPES.find((x) => x.id === type)!;
  const chosenDay = days.find((d) => d.iso === date);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = "Choose a day.";
    else if (!time) e.time = "Choose a time.";
    if (!form.name.trim()) e.name = "Please add your name.";
    if (!EMAIL.test(form.email.trim())) e.email = "Enter a valid email for your confirmation.";
    setErr(e);
    if (Object.keys(e).length) {
      document.getElementById(`${uid}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setDone(true);
  };

  if (done && chosenDay)
    return (
      <div role="status" className="rounded-[2rem] bg-forest p-8 text-ivory md:p-12">
        <p className="eyebrow text-gold-pale">You&apos;re booked</p>
        <p className="mt-3 font-display text-4xl">
          {chosenDay.d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, {time}
        </p>
        <p className="mt-3 text-ivory/85">
          {t.name} · {t.mins} minutes · {mode === "showroom" ? `${site.address.street}, Dallas` : "Video call (we'll email a link)"}
        </p>
        <p className="mt-6 max-w-lg text-sm text-ivory/75">
          A confirmation would go to {form.email} in the live site (demo: nothing was sent). Need to change it? Call {site.phone}.
        </p>
      </div>
    );

  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="font-display text-3xl">What would you like to do?</legend>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {TYPES.map((x) => (
            <label key={x.id} className={clsx("flex cursor-pointer flex-col rounded-xl border px-4 py-3", type === x.id ? "border-ink bg-bone" : "border-ink/15 hover:border-ink/40")}>
              <input type="radio" name="type" className="sr-only" checked={type === x.id} onChange={() => setType(x.id)} />
              <span className="font-medium">
                {x.name} <span className="font-normal text-taupe">· {x.mins} min</span>
              </span>
              <span className="text-sm text-taupe">{x.note}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Where">
          {(["showroom", "video"] as const).map((m) => (
            <label key={m} className="chip">
              <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
              {m === "showroom" ? "In the showroom" : "Video call"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-3xl">Pick a day</legend>
        <p className="mt-1 text-sm text-taupe">Closed Mondays. Sunday afternoons are quietest.</p>
        <div id={`${uid}-date`} tabIndex={-1} className="no-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2" data-cursor="Drag">
          {days.map((d) => (
            <label
              key={d.iso}
              className={clsx(
                "flex min-w-[4.6rem] shrink-0 cursor-pointer flex-col items-center rounded-xl border py-3 transition-colors",
                !d.open && "cursor-not-allowed opacity-40",
                date === d.iso ? "border-ink bg-ink text-ivory" : "border-ink/15 hover:border-ink/40",
              )}
            >
              <input
                type="radio"
                name="day"
                className="sr-only"
                disabled={!d.open}
                checked={date === d.iso}
                onChange={() => {
                  setDate(d.iso);
                  setTime(null);
                  setErr((e) => ({ ...e, date: "" }));
                }}
                aria-label={d.d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + (d.open ? "" : ", closed")}
              />
              <span className="spec">{d.d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="font-display text-2xl">{d.d.getDate()}</span>
              <span className="text-xs opacity-75">{d.d.toLocaleDateString("en-US", { month: "short" })}</span>
            </label>
          ))}
        </div>
        {err.date && <p className="mt-2 text-sm text-error">{err.date}</p>}

        {date && (
          <div className="mt-6 [animation:fade-up_0.5s_var(--ease-out-expo)_both]">
            <p className="text-sm font-medium" id={`${uid}-time-label`}>
              Times on {chosenDay?.d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <div id={`${uid}-time`} tabIndex={-1} role="radiogroup" aria-labelledby={`${uid}-time-label`} className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {slots.map((s) => (
                <label key={s.t} className={clsx("chip justify-center", s.taken && "cursor-not-allowed line-through opacity-40")}>
                  <input type="radio" name="time" className="sr-only" disabled={s.taken} checked={time === s.t} onChange={() => setTime(s.t)} aria-label={s.taken ? `${s.t}, booked` : s.t} />
                  {s.t}
                </label>
              ))}
            </div>
            {err.time && <p className="mt-2 text-sm text-error">{err.time}</p>}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 font-display text-3xl">Your details</legend>
        {(
          [
            ["name", "Name", "text", "name"],
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
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
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
          <label htmlFor={`${uid}-notes`} className="text-sm font-medium">
            Anything we should prepare? (optional)
          </label>
          <textarea id={`${uid}-notes`} rows={3} className="field mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. oval, around 1.5 ct, yellow gold, budget about $5k" />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-bone p-5">
        <p className="text-sm">
          {date && time ? (
            <>
              <strong>{t.name}</strong> · {chosenDay?.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {time} · {mode === "showroom" ? "Showroom" : "Video"}
            </>
          ) : (
            <span className="text-taupe">Choose a day and time to book.</span>
          )}
        </p>
        <button type="button" onClick={submit} className="btn btn-ink">
          Book appointment
        </button>
      </div>
    </div>
  );
}
