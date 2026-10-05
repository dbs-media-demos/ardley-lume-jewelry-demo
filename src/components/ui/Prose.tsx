import type { ReactNode } from "react";

/** Long-form text block for policy pages. */
export function Prose({ sections }: { sections: { h: string; body: ReactNode }[] }) {
  return (
    <div className="max-w-2xl space-y-12">
      {sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)]">{s.h}</h2>
          <div className="mt-3 space-y-3 leading-relaxed text-ink/85 [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc">{s.body}</div>
        </section>
      ))}
    </div>
  );
}
