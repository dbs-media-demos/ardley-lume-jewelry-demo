import clsx from "clsx";
import type { Brand } from "@/lib/card";
import { brandLabel } from "@/lib/card";

/** A small card that mirrors what you type and turns over while the security code is focused. Purely visual. */
export function CardPreview({ number, name, exp, brand, flipped, cvc }: { number: string; name: string; exp: string; brand: Brand; flipped: boolean; cvc: string }) {
  const digits = number.replace(/\D/g, "");
  const shown = (brand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••").split("").map((ch, i, arr) => {
    // reveal typed digits in place of bullets
    const idx = arr.slice(0, i).filter((c) => c !== " ").length;
    return ch === " " ? " " : digits[idx] ?? ch;
  });
  return (
    <div className="mx-auto w-full max-w-[15rem] [perspective:1000px]" aria-hidden>
      <div className={clsx("relative aspect-[1.586] transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]", flipped && "[transform:rotateY(180deg)]")}>
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl bg-[linear-gradient(135deg,#17231e,#0e1311_55%,#4b1d24)] p-4 text-ivory shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
          <div className="flex items-center justify-between">
            <span className="block h-6 w-8 rounded-md bg-[linear-gradient(135deg,#f3dc9b,#a8823b)]" />
            <span className="spec text-gold-pale">{brand === "unknown" ? "" : brandLabel[brand]}</span>
          </div>
          <p className="font-mono text-[0.92rem] tracking-[0.12em] whitespace-nowrap">{shown.join("")}</p>
          <div className="flex items-end justify-between text-[0.62rem] tracking-[0.14em] uppercase">
            <span className="max-w-[9rem] truncate">{name || "Your name"}</span>
            <span>{exp || "MM / YY"}</span>
          </div>
          <span className="pointer-events-none absolute -right-6 -bottom-8 size-28 rounded-full border-[10px] border-gold/20" />
        </div>
        <div className="absolute inset-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1c2a24,#0e1311)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-5 h-8 bg-ink" />
          <div className="mx-4 mt-4 flex h-8 items-center justify-end rounded bg-ivory/90 pr-3 font-mono text-sm tracking-widest text-ink">{cvc ? cvc.replace(/./g, "•") : "CVC"}</div>
          <p className="mx-4 mt-3 text-[0.6rem] text-ivory/60">Demo card preview. Nothing is stored or sent.</p>
        </div>
      </div>
    </div>
  );
}
