import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

// Brand fonts, read once. URLs relative to this file are traced into the deployment.
const [serif, sans] = await Promise.all([
  readFile(new URL("../../../assets/fonts/Gloock-400.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/InstrumentSans.ttf", import.meta.url)),
]);

/** Only local, known-safe paths under /images, served as absolute URLs (Satori fetches them). */
function photo(src: string | null, base: string) {
  if (!src || !/^\/images\/[\w\-/.]+\.(jpg|png)$/.test(src)) return null;
  return new URL(src, base).toString();
}

/** Branded 1200×630 share image: /api/og?title=…&eyebrow=…&image=/images/… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Fine jewelry, made in the light.").slice(0, 100);
  const eyebrow = (searchParams.get("eyebrow") ?? "Knox-Henderson · Dallas").slice(0, 60);
  const img = photo(searchParams.get("image") ?? "/images/scenes/hero-portrait.jpg", req.url);
  const size = title.length > 60 ? 58 : title.length > 34 ? 72 : 88;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#0e1311", fontFamily: "Instrument" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 56px 56px 68px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="44" height="44" viewBox="0 0 40 40">
              <circle cx="18" cy="22" r="12.5" fill="none" stroke="#f8f4ec" strokeWidth="2.2" />
              <path d="M30 2.5 C30.6 7.6 32.4 9.4 37.5 10 C32.4 10.6 30.6 12.4 30 17.5 C29.4 12.4 27.6 10.6 22.5 10 C27.6 9.4 29.4 7.6 30 2.5 Z" fill="#c9a55c" />
            </svg>
            <div style={{ display: "flex", fontFamily: "Gloock", fontSize: 30, letterSpacing: 4, color: "#f8f4ec" }}>
              ARDLEY <span style={{ color: "#c9a55c", margin: "0 10px" }}>&amp;</span> LUME
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", color: "#e8d6a8", fontSize: 20, letterSpacing: 5, textTransform: "uppercase" }}>{eyebrow}</div>
            <div style={{ display: "flex", fontFamily: "Gloock", fontSize: size, lineHeight: 1.0, letterSpacing: -1.5, color: "#f8f4ec", maxWidth: 640 }}>{title}</div>
          </div>
          <div style={{ display: "flex", color: "#aea698", fontSize: 20 }}>Fine jewelry · Engagement rings · Made in Dallas</div>
        </div>
        <div style={{ width: 430, display: "flex", padding: "40px 40px 40px 0" }}>
          <div style={{ flex: 1, display: "flex", borderRadius: 24, overflow: "hidden", backgroundColor: "#17231e", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img ? <img src={img} alt="" width={390} height={550} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Gloock", data: serif, weight: 400, style: "normal" },
        { name: "Instrument", data: sans, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
