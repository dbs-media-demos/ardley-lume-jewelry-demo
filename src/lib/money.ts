/** "$1,234" without Intl (it's slow to build during hydration on phones). */
export function money(n: number, cents = false) {
  const neg = n < 0;
  const units = Math.round(Math.abs(n) * (cents ? 100 : 1));
  const whole = cents ? Math.floor(units / 100) : units;
  const s = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const c = cents ? "." + String(units % 100).padStart(2, "0") : "";
  return `${neg ? "-" : ""}$${s}${c}`;
}
