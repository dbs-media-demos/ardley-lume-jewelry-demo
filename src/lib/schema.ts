import "server-only";
import { site, siteUrl, dayNames } from "@/content/site";
import type { Product } from "@/lib/commerce/types";
import { defaultVariant, listPrice, variantPrice } from "@/lib/commerce/pricing";
import { img } from "@/lib/images";
import { categoryBySlug } from "@/content/catalog";

const abs = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);
const STORE_ID = `${siteUrl}/#store`;

export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": STORE_ID,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: siteUrl,
    logo: abs("/icon-512.png"),
    image: abs("/images/scenes/showroom.jpg"),
    telephone: "+1-214-555-0163",
    email: site.email,
    priceRange: "$180–$9,800",
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.serviceArea.map((name) => ({ "@type": name.startsWith("Nationwide") ? "Country" : "City", name: name.startsWith("Nationwide") ? "United States" : name })),
    openingHoursSpecification: site.hours
      .filter((h) => h.open)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${dayNames[h.day]}`, opens: h.open, closes: h.close })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5 },
    sameAs: [site.instagram],
    hasMerchantReturnPolicy: returnPolicy(),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: site.name,
    url: siteUrl,
    publisher: { "@id": STORE_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function itemListSchema(name: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/product/${p.slug}`), name: p.name })),
  };
}

function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: site.returnDays,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
}

function shippingDetails(price: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: price >= site.freeShippingOver ? 0 : 12, currency: "USD" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
    },
  };
}

export function productSchema(p: Product) {
  const v = defaultVariant(p);
  const { price } = variantPrice(p, v);
  const saleEnd = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const images = [img(p.images.hero).src, img(p.images.model).src].map(abs);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    sku: p.sku,
    image: images,
    category: categoryBySlug[p.category]?.plural,
    brand: { "@type": "Brand", name: site.name },
    material: p.metals.map((m) => m.replace("-", " ")).join(", "),
    url: abs(`/product/${p.slug}`),
    offers: {
      "@type": "Offer",
      url: abs(`/product/${p.slug}`),
      priceCurrency: "USD",
      price,
      ...(p.sale ? { priceValidUntil: saleEnd, priceSpecification: { "@type": "UnitPriceSpecification", priceType: "https://schema.org/StrikethroughPrice", price: listPrice(p, v), priceCurrency: "USD" } } : {}),
      availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": STORE_ID },
      shippingDetails: shippingDetails(price),
      hasMerchantReturnPolicy: returnPolicy(),
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5 },
    review: p.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      name: r.title,
      reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
  };
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: abs(path),
    provider: { "@id": STORE_ID },
    areaServed: { "@type": "Country", name: "United States" },
  };
}
