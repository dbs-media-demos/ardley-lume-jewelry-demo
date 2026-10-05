"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "right" | "center" | "top";
  className?: string;
  children: ReactNode;
};

/**
 * Accessible overlay panel: traps focus, closes on Esc and backdrop click, locks
 * scroll (including Lenis) and hands focus back to whatever opened it.
 */
export function Sheet({ open, onClose, label, side = "right", className, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const lenis = (window as Window & { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
      returnTo.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <div
      className={clsx("fixed inset-0 z-[150] transition-[visibility] duration-700", !open && "pointer-events-none invisible")}
      inert={!open}
      aria-hidden={!open}
    >
      <div
        className={clsx("absolute inset-0 bg-ink/55 backdrop-blur-[3px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
        onClick={() => close.current()}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={clsx(
          "absolute flex flex-col overflow-hidden bg-ivory text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]",
          side === "right" && ["top-0 right-0 h-full w-full max-w-[29rem]", open ? "translate-x-0" : "translate-x-full"],
          side === "top" && ["inset-x-0 top-0 max-h-[100dvh]", open ? "translate-y-0" : "-translate-y-full"],
          side === "center" && [
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[86vh] md:w-[min(64rem,92vw)] md:rounded-2xl",
            open ? "translate-y-0 opacity-100 md:-translate-x-1/2 md:-translate-y-1/2" : "translate-y-full opacity-0 md:-translate-x-1/2 md:-translate-y-[45%]",
          ],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
