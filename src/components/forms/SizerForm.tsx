"use client";

import { useId, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Not sure? We'll send a free sizer." Validates, shows success, sends nothing. */
export function SizerForm() {
  const uid = useId();
  const [f, setF] = useState({ name: "", email: "", address: "", zip: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  if (done)
    return (
      <p role="status" className="rounded-2xl bg-forest p-6 text-ivory">
        A free plastic sizer is on its way to {f.name.split(" ")[0]} in 2–4 days, in a plain envelope so it won&apos;t spoil a surprise. (Demo: nothing was sent.)
      </p>
    );
  const fields = [
    ["name", "Name", "name"],
    ["email", "Email", "email"],
    ["address", "Street address", "street-address"],
    ["zip", "ZIP code", "postal-code"],
  ] as const;
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const x: Record<string, string> = {};
        if (!f.name.trim()) x.name = "Please add a name.";
        if (!EMAIL.test(f.email.trim())) x.email = "Enter a valid email.";
        if (f.address.trim().length < 5) x.address = "Enter a street address.";
        if (!/^\d{5}$/.test(f.zip.trim())) x.zip = "ZIP codes have 5 digits.";
        setErr(x);
        if (Object.keys(x).length) document.getElementById(`${uid}-${Object.keys(x)[0]}`)?.focus();
        else setDone(true);
      }}
    >
      {fields.map(([k, label, ac]) => (
        <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
          <label htmlFor={`${uid}-${k}`} className="text-sm font-medium">
            {label}
          </label>
          <input
            id={`${uid}-${k}`}
            autoComplete={ac}
            type={k === "email" ? "email" : "text"}
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
      <button type="submit" className="btn btn-ink sm:col-span-2 sm:justify-self-start">
        Send me a free sizer
      </button>
    </form>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-ghost">
      Print the sizer
    </button>
  );
}
