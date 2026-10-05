"use client";

import Image from "next/image";
import { useEffect, useRef, useState, ViewTransition } from "react";
import clsx from "clsx";
import type { CardImg } from "@/lib/card-types";
import type { Tone } from "@/lib/commerce/types";
import { HandScale } from "./HandScale";

type Props = {
  slug: string;
  name: string;
  tone: Tone;
  /** Hero photo per tone (falls back to the photographed tone). */
  heroes: Record<Tone, CardImg>;
  rest: CardImg[];
  scale: { kind: "ring" | "other"; mm: number; stoneMm?: number; hand: CardImg };
  metalLabel: string;
};

/**
 * Product gallery.
 * Desktop: photos stacked on the left (the buy box stays sticky on the right),
 * a hover lens on each photo. Phones: a swipe strip with a counter; tap opens a
 * fullscreen viewer with tap-to-zoom and pan. The first photo is the morph target
 * for the shared-element transition from the grid, and it changes metal with a
 * crossfade and a sweep of light.
 */
export function ProductGallery({ slug, name, tone, heroes, rest, scale, metalLabel }: Props) {
  const [view, setView] = useState<"photos" | "hand">("photos");
  const [full, setFull] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const firstTone = useRef(tone);

  // Light sweep whenever the metal changes.
  useEffect(() => {
    if (firstTone.current === tone) return;
    firstTone.current = tone;
    const el = sweep.current;
    if (!el) return;
    delete el.dataset.glint;
    void el.offsetWidth;
    el.dataset.glint = "on";
  }, [tone]);

  const tones = Array.from(new Map((["yellow", "white", "rose"] as Tone[]).map((t) => [heroes[t].src, heroes[t]])).values());
  const photos = [heroes[tone], ...rest];

  const hero = (
    <div ref={sweep} className="glint relative aspect-[4/5] overflow-hidden bg-bone md:rounded-2xl">
      {tones.map((im, i) => (
        <Image
          key={im.src}
          src={im.src}
          alt={im.src === heroes[tone].src ? `${name} in ${metalLabel}` : ""}
          aria-hidden={im.src !== heroes[tone].src}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={85}
          preload={i === 0}
          placeholder={im.blur ? "blur" : "empty"}
          blurDataURL={im.blur || undefined}
          className={clsx("object-cover transition-opacity duration-700 ease-[var(--ease-out-expo)]", im.src === heroes[tone].src ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>
  );

  return (
    <div className="relative">
      {/* view toggle */}
      <div className="absolute top-4 left-4 z-10 flex rounded-full bg-ivory/90 p-1 text-xs font-semibold shadow backdrop-blur md:top-5 md:left-5" role="group" aria-label="Gallery view">
        {(["photos", "hand"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={clsx("min-h-9 rounded-full px-3.5 tracking-wide transition-colors", view === v ? "bg-ink text-ivory" : "text-ink hover:bg-ink/5")}
          >
            {v === "photos" ? "Photos" : scale.kind === "ring" ? "On a hand" : "Actual size"}
          </button>
        ))}
      </div>

      {view === "hand" ? (
        <HandScale tone={tone} {...scale} name={name} />
      ) : (
        <>
          {/* One list: a swipe strip on phones, a stacked grid with hover lenses on desktop. */}
          <div
            ref={strip}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible"
            onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
          >
            {photos.map((p, i) => (
              <Lens
                key={p.src + i}
                src={p.src}
                className={clsx("w-full shrink-0 snap-center", i === 0 && "md:col-span-2")}
                onOpen={() => setFull(i)}
                label={`Open photo ${i + 1} of ${photos.length} full screen`}
              >
                {i === 0 ? (
                  <ViewTransition name={`product-${slug}`} share="morph" default="none">
                    {hero}
                  </ViewTransition>
                ) : (
                  <div className="relative aspect-[4/5] overflow-hidden bg-bone md:rounded-2xl">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 28vw, 100vw"
                      quality={75}
                      className="object-cover"
                      placeholder={p.blur ? "blur" : "empty"}
                      blurDataURL={p.blur || undefined}
                    />
                  </div>
                )}
              </Lens>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
            {photos.map((_, i) => (
              <span key={i} className={clsx("h-1 rounded-full transition-all duration-500", i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/25")} />
            ))}
          </div>
        </>
      )}

      {full !== null && <Fullscreen photos={photos} start={full} onClose={() => setFull(null)} name={name} />}
    </div>
  );
}

/** Hover magnifier for mouse users; a tap (or Enter) opens the fullscreen viewer. */
function Lens({ src, children, className, onOpen, label }: { src: string; children: React.ReactNode; className?: string; onOpen: () => void; label: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const hi = `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=85`;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={clsx("relative cursor-zoom-in", className)}
      data-cursor="Zoom"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerLeave={() => setPos(null)}
    >
      {children}
      <div
        aria-hidden
        className={clsx("pointer-events-none absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-300", pos ? "opacity-100" : "opacity-0")}
        style={pos ? { backgroundImage: `url("${hi}")`, backgroundSize: "220%", backgroundPosition: `${pos.x}% ${pos.y}%` } : undefined}
      />
    </div>
  );
}

/** Fullscreen viewer: swipe between photos, tap to zoom 2.5×, drag to pan, Esc / × to close. */
function Fullscreen({ photos, start, onClose, name }: { photos: CardImg[]; start: number; onClose: () => void; name: string }) {
  const [zoom, setZoom] = useState<{ i: number; x: number; y: number } | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = strip.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    closeBtn.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [start, onClose]);

  return (
    <div className="fixed inset-0 z-[160] bg-ink" role="dialog" aria-modal="true" aria-label={`${name}, photos`}>
      <button ref={closeBtn} type="button" onClick={onClose} className="absolute top-3 right-3 z-10 grid size-12 place-items-center rounded-full bg-ivory/10 text-2xl text-ivory" aria-label="Close photos">
        ×
      </button>
      <div ref={strip} className={clsx("no-scrollbar flex h-full snap-x snap-mandatory", zoom ? "overflow-hidden" : "overflow-x-auto")}>
        {photos.map((p, i) => (
          <div
            key={p.src + i}
            className="relative h-full w-full shrink-0 snap-center touch-pan-x overflow-hidden"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom((z) => (z ? null : { i, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }));
            }}
            onPointerMove={(e) => {
              if (!zoom || zoom.i !== i) return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ i, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="100vw"
              quality={85}
              className="object-contain transition-transform duration-300"
              style={zoom?.i === i ? { transform: "scale(2.5)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </div>
        ))}
      </div>
      <p className="spec pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-ivory/70">Tap to zoom · swipe for more</p>
    </div>
  );
}
