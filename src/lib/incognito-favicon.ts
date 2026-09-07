/**
 * The favicon the browser tab wears while you are on /incognito.
 *
 * Same language as the real one (amber on the site's near-black, flat fills,
 * no strokes so it survives 16px): hat, brim, glasses. A browser changes its
 * own chrome when you go incognito — this is the smallest honest version of
 * that, and it happens in the one place the site's whole metaphor lives.
 */
const AMBER = "#F7A224";
const INK = "#0F0D0B";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="${INK}"/>
<path d="M23 12h18l5 15H18z" fill="${AMBER}"/>
<rect x="11" y="27" width="42" height="6" rx="3" fill="${AMBER}"/>
<rect x="15" y="38" width="15" height="12" rx="4" fill="${AMBER}"/>
<rect x="34" y="38" width="15" height="12" rx="4" fill="${AMBER}"/>
<rect x="29" y="42" width="6" height="3" fill="${AMBER}"/>
</svg>`;

export const INCOGNITO_FAVICON = `data:image/svg+xml,${encodeURIComponent(SVG.replace(/\n/g, ""))}`;

/**
 * Points every icon link at the incognito glyph, and returns a restore.
 *
 * Only `href` and `type` are touched. The first version removed the original
 * <link> elements and re-inserted them on cleanup, which broke the moment the
 * router re-rendered <head> in between: the saved sibling references went
 * stale, insertBefore threw, and the site navigated away with no favicon at
 * all. Writing an attribute cannot go stale — and if the router does replace
 * the nodes, its fresh ones already carry the right href.
 */
export function wearIncognitoFavicon(): () => void {
  if (typeof document === "undefined") return () => {};

  const selector = 'link[rel~="icon"]';
  const originals = [...document.querySelectorAll<HTMLLinkElement>(selector)].map((link) => ({
    link,
    href: link.getAttribute("href"),
    type: link.getAttribute("type"),
  }));

  for (const { link } of originals) {
    link.setAttribute("href", INCOGNITO_FAVICON);
    link.setAttribute("type", "image/svg+xml");
  }

  return () => {
    for (const { link, href, type } of originals) {
      if (href === null) link.removeAttribute("href");
      else link.setAttribute("href", href);
      if (type === null) link.removeAttribute("type");
      else link.setAttribute("type", type);
    }
  };
}
