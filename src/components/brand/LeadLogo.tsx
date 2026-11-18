import clsx from "clsx";

/**
 * The lead's own logo from the CRM (sanitised there), inline so its ink is currentColor and it follows
 * the header's light/dark states. Size it by height; the width follows the logo's viewBox.
 */
export function LeadLogo({ svg, label, className }: { svg: string; label?: string; className?: string }) {
  return <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={clsx("lead-logo", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}
