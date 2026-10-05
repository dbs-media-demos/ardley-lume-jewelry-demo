"use client";

import { useId, useState } from "react";

/** Newsletter sign-up: validates and shows a success state. Sends nothing (demo). */
export function Newsletter() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  if (state === "done")
    return (
      <p role="status" className="mt-6 max-w-sm rounded-xl border border-gold/40 px-5 py-4 text-sm text-gold-pale">
        You&apos;re on the list. The first letter arrives with our next collection. (Demo: nothing was sent.)
      </p>
    );

  return (
    <form
      noValidate
      className="mt-6 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        setState(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "done" : "error");
      }}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-2 rounded-full border border-ivory/25 p-1 pl-5 focus-within:border-gold">
        <input
          id={id}
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? `${id}-err` : undefined}
          className="min-h-11 w-full bg-transparent text-ivory placeholder:text-mist focus:outline-none"
        />
        <button type="submit" className="btn btn-gold min-h-11 shrink-0 px-5">
          Join
        </button>
      </div>
      {state === "error" && (
        <p id={`${id}-err`} className="mt-2 pl-5 text-sm text-[#f0a3a3]">
          Please enter a valid email address.
        </p>
      )}
    </form>
  );
}
