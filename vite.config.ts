import { fileURLToPath } from "node:url";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ command, mode }) => ({
  // Vite exposes VITE_* on the client automatically, but the SSR/nitro
  // environment does not get the same treatment — inline them explicitly so
  // `import.meta.env.VITE_*` resolves the same on both sides.
  define: Object.fromEntries(
    Object.entries(loadEnv(mode, process.cwd(), "VITE_")).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ]),
  ),

  css: { transformer: "lightningcss" },

  resolve: {
    alias: { "@": srcDir },
    // A second copy of React or Query breaks hooks and the query cache.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },

  server: { port: 8080 },

  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Keeps server-only modules out of the client bundle instead of failing
      // silently at runtime.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      // Route Start's server entry through src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    // Nitro only participates in production builds. cloudflare-module emits a
    // Workers bundle plus .output/server/wrangler.json; NITRO_PRESET or a
    // platform's own auto-detection still overrides it in CI.
    ...(command === "build" ? [nitro({ defaultPreset: "cloudflare-module" })] : []),
    viteReact(),
  ],
}));
