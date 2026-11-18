import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { BizProvider } from "@/components/preview/BizContext";
import { PreviewGuard } from "@/components/preview/PreviewGuard";
import { LeadLoader } from "@/components/preview/LeadLoader";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { previewBiz } from "@/lib/preview";

/**
 * A personalised preview made in the Scale by Noon CRM: this demo's homepage with a real
 * business's name, phone, address, hours, rating, logo and towns. The token is the key;
 * removing the demo in the CRM makes the page 404. With a logo, the first view in a tab
 * opens on it (LeadLoader).
 */
export default async function PreviewLayout({ children, params }: { children: ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params;
  const biz = await previewBiz(token);
  if (!biz) notFound();
  return (
    <BizProvider biz={biz}>
      {biz.logo && <LeadLoader token={token} svg={biz.logo.svg} />}
      <StoreChrome biz={biz}>{children}</StoreChrome>
      <PreviewGuard />
    </BizProvider>
  );
}
