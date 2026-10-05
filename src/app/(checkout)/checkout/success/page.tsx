import type { Metadata } from "next";
import { Success } from "@/components/checkout/Success";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Thank you", description: "Your order is confirmed.", path: "/checkout/success", noindex: true });

export default function SuccessPage() {
  return <Success />;
}
