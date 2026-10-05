import { catalog } from "@/lib/commerce";
import { toCard } from "@/lib/cards";

/** Static JSON of every product card. Fetched lazily by search, quick view and cart cross-sells. */
export const dynamic = "force-static";

export async function GET() {
  const products = await catalog.getProducts();
  return Response.json(products.map(toCard));
}
