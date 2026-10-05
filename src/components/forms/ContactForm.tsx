"use client";

import { useId, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ["A product question", "Engagement rings", "An existing order", "Repair or resizing", "Press or something else"];

/** Contact form: validates, shows success, sends nothing (demo). */
export function ContactForm() {
  const uid = useId();
  const [f, setF] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  if (done)
    return (
      <p role="status" className="rounded-2xl bg-forest p-6 text-ivory">
        Thanks, {f.name.split(" ")[0]}. We&apos;ll reply to {f.email} within one business day. (Demo: nothing was sent.)
      </p>
    );
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const x: Record<string, string> = {};
        if (!f.name.trim()) x.name = "Please add your name.";
        if (!EMAIL.test(f.email.trim())) x.email = "Enter a valid email so we can reply.";
        if (f.message.trim().length < 10) x.message = "A sentence or two, please.";
        setErr(x);
        if (Object.keys(x).length) document.getElementById(`${uid}-${Object.keys(x)[0]}`)?.focus();
        else setDone(true);
      }}
    >
      {(
        [
          ["name", "Name", "text", "name"],
          ["email", "Email", "email", "email"],
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
        <label htmlFor={`${uid}-topic`} className="text-sm font-medium">
          Topic
        </label>
        <select id={`${uid}-topic`} className="field mt-1.5" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-message`} className="text-sm font-medium">
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          rows={5}
          className="field mt-1.5"
          value={f.message}
          onChange={(e) => setF({ ...f, message: e.target.value })}
          aria-invalid={!!err.message}
          aria-describedby={err.message ? `${uid}-message-err` : undefined}
        />
        {err.message && (
          <p id={`${uid}-message-err`} className="mt-1 text-sm text-error">
            {err.message}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-ink sm:col-span-2 sm:justify-self-start">
        Send message
      </button>
    </form>
  );
}
