import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";

// Vitest doesn't load .env itself the way Next does — read it directly so
// TEST_DATABASE_URL / BETTER_AUTH_SECRET are available before any test
// file (and the prisma client singleton it imports) is evaluated.
function loadDotEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match) out[match[1]] = match[2];
  }
  return out;
}

const envFile = loadDotEnv(path.resolve(import.meta.dirname, ".env"));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/helpers/setup.ts"],
    // Tests that share the database run sequentially — see tests/helpers/db.ts:
    // resetDb() truncates every table, so parallel files would stomp on
    // each other's fixtures.
    fileParallelism: false,
    env: {
      DATABASE_URL: envFile.TEST_DATABASE_URL,
      BETTER_AUTH_SECRET: envFile.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: envFile.BETTER_AUTH_URL,
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      // lib/*.ts files import "server-only" as a guard against being
      // bundled into client code. Outside Next's bundler that package's
      // default export throws unconditionally — alias straight to its
      // no-op "react-server condition" build instead.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
});
