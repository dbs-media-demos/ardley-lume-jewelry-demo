import type { CheckoutProvider, TrackResult } from "./provider";
import type { Order } from "./types";
import { computeTotals, shippingMethods } from "./pricing";

/*
 * Demo checkout. Nothing here makes a network request or stores card data:
 * `placeOrder` only receives the card brand and last four digits, waits ~1.5 s to
 * feel like a real authorisation, and returns an order.
 *
 * With Stripe, `createCheckout` would call a route handler that creates a
 * PaymentIntent, and `placeOrder` would call `stripe.confirmPayment()` with the
 * Elements instance. With Shopify, the cart would be handed to `checkoutUrl`.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function orderNumber() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `AL-${n}`;
}

export const mockCheckout: CheckoutProvider = {
  async createCheckout() {
    return { checkoutId: `chk_demo_${Date.now().toString(36)}` };
  },

  async placeOrder(input) {
    await wait(1500);
    const shipping = shippingMethods.find((m) => m.id === input.shippingId) ?? shippingMethods[0];
    const order: Order = {
      number: orderNumber(),
      email: input.email,
      lines: input.lines,
      extras: input.extras,
      address: input.address,
      pickup: input.pickup,
      shipping,
      totals: computeTotals(input.lines, input.extras, { shippingId: input.shippingId, state: input.state }),
      placedAt: new Date().toISOString(),
      cardBrand: input.paymentToken.brand,
      cardLast4: input.paymentToken.last4,
    };
    return order;
  },

  async trackOrder(number, email) {
    await wait(700);
    if (!/^AL-?\d{4,6}$/i.test(number.trim()) || !email.includes("@")) return undefined;
    const now = Date.now();
    const day = 86400000;
    const fmt = (t: number) => new Date(t).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const result: TrackResult = {
      number: number.trim().toUpperCase().replace(/^AL-?/, "AL-"),
      status: "In transit",
      carrier: "Insured courier · signature required",
      eta: fmt(now + day * 2),
      steps: [
        { label: "Order confirmed", detail: "Payment authorised, receipt emailed.", at: fmt(now - day * 4), done: true },
        { label: "At the bench", detail: "Sized, polished and checked under the loupe by Theo.", at: fmt(now - day * 3), done: true },
        { label: "Boxed & insured", detail: "Gift-boxed in Dallas, fully insured for its value.", at: fmt(now - day * 1), done: true },
        { label: "In transit", detail: "With the courier. Signature on delivery.", at: fmt(now), done: true },
        { label: "Delivered", detail: "Expected by 7 pm local time.", done: false },
      ],
    };
    return result;
  },
};
