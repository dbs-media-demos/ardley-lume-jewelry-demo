import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content: navigations crossfade with a soft rise, while named
 * product images morph on top. (In each page, not a layout or template: layouts
 * persist, so enter/exit would never fire there.)
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
