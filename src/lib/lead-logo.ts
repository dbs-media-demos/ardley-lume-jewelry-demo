/**
 * The lead's own logo, as the CRM sends it (already sanitised there): `<svg viewBox>` with
 * `<g data-part="mark">` (shapes, each with a stroke and its final fill) and `<g data-part="word">`
 * (the name). Ink is currentColor, so it takes the colour of wherever it sits.
 */

const SHAPE = /<(path|circle|rect|line|polyline|polygon|ellipse)\b((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

/** The `<g data-part="mark" …>…</g>` element's span in the markup, nested groups included. */
function markSpan(svg: string): [number, number, number] | null {
  const open = /<g\b[^>]*\bdata-part\s*=\s*["']mark["'][^>]*>/.exec(svg);
  if (!open) return null;
  const bodyStart = open.index + open[0].length;
  const tags = /<g\b[^>]*?(\/?)>|<\/g\s*>/g;
  tags.lastIndex = bodyStart;
  let depth = 1;
  for (let m = tags.exec(svg); m; m = tags.exec(svg)) {
    if (m[0].startsWith("</")) depth--;
    else if (!m[1]) depth++;
    if (depth === 0) return [open.index, bodyStart, m.index];
  }
  return null;
}

/**
 * The loader's copy: every mark shape gets pathLength="1" (so its outline can be drawn with a
 * dash offset of 1 → 0) and its place in the stagger (--d: stroke delay, --fd: fill delay).
 */
export function loaderSvg(svg: string) {
  const span = markSpan(svg);
  if (!span) return svg;
  const [, bodyStart, bodyEnd] = span;
  const body = svg.slice(bodyStart, bodyEnd);
  const n = body.match(SHAPE)?.length ?? 0;
  const step = n > 1 ? Math.min(0.08, 0.36 / (n - 1)) : 0;
  let i = 0;
  const out = body.replace(SHAPE, (_m, tag: string, attrs: string, slash: string) => {
    const k = i++;
    const fo = /\sfill-opacity\s*=\s*["']([\d.]+)["']/.exec(attrs)?.[1];
    const vars = `--d:${(0.08 + k * step).toFixed(3)}s;--fd:${(0.72 + k * Math.min(0.05, 0.2 / Math.max(1, n - 1))).toFixed(3)}s${fo ? `;--fo:${fo}` : ""}`;
    let a = attrs.replace(/\spathLength\s*=\s*["'][^"']*["']/i, "");
    if (/\sstyle\s*=\s*"/.test(a)) a = a.replace(/\sstyle\s*=\s*"([^"]*)"/, (_s, st: string) => ` style="${st.replace(/;?\s*$/, ";")}${vars}"`);
    else a += ` style="${vars}"`;
    return `<${tag}${a} pathLength="1" data-ll${slash ? " /" : ""}>`;
  });
  return svg.slice(0, bodyStart) + out + svg.slice(bodyEnd);
}
