/**
 * One-off helper: serves scripts/og-card.html and accepts the rendered PNG back.
 *
 *   bun run scripts/export-og.ts
 *   → open http://localhost:9099/ and click "download PNG",
 *     or POST a data URL to http://localhost:9099/save
 *
 * Not part of the build. public/og.png is committed; this only exists so the
 * card can be regenerated after an edit to og-card.html.
 */
const CARD = new URL("./og-card.html", import.meta.url);
const OUT = new URL("../public/og.png", import.meta.url);

const server = Bun.serve({
  port: 9099,
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname === "/save") {
      const dataUrl = await request.text();
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      await Bun.write(OUT, Buffer.from(base64, "base64"));
      const { size } = await Bun.file(OUT).stat();
      console.log(`public/og.png written (${size} bytes)`);
      return new Response("ok", { headers: { "access-control-allow-origin": "*" } });
    }

    return new Response(Bun.file(CARD), { headers: { "content-type": "text/html" } });
  },
});

console.log(`og-card served on http://localhost:${server.port}/`);
