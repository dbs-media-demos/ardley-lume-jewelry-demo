/*
 * Card helpers for the demo checkout. Pure functions; nothing here stores, logs
 * or sends anything. With Stripe these checks are done by Elements instead.
 */

export type Brand = "visa" | "mastercard" | "amex" | "unknown";

export function detectBrand(num: string): Brand {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function formatCardNumber(raw: string) {
  const n = raw.replace(/\D/g, "");
  const brand = detectBrand(n);
  if (brand === "amex") {
    const d = n.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return (n.slice(0, 16).match(/.{1,4}/g) ?? []).join(" ");
}

export function luhn(num: string) {
  const n = num.replace(/\D/g, "");
  if (n.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function formatExpiry(raw: string) {
  const n = raw.replace(/\D/g, "").slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)} / ${n.slice(2)}`;
}

export function validExpiry(v: string) {
  const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return "Use MM / YY.";
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return "That month doesn't exist.";
  const now = new Date();
  const end = new Date(year, month, 0, 23, 59);
  if (end < now) return "This card has expired.";
  if (year > now.getFullYear() + 20) return "Check the year.";
  return null;
}

export const brandLabel: Record<Brand, string> = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", unknown: "Card" };
