import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = resolve(rootDir, "src/userscript/metadata.ts");

async function readMetadataBanner() {
  const source = await readFile(metadataPath, "utf8");
  const match = source.match(/export const USERSCRIPT_METADATA = `([\s\S]*?)`;/);

  if (!match) {
    throw new Error(`Could not read userscript metadata from ${metadataPath}`);
  }

  return match[1];
}

await mkdir(resolve(rootDir, "dist"), { recursive: true });

await build({
  entryPoints: [resolve(rootDir, "src/userscript/entry.ts")],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: resolve(rootDir, "dist/bilibili-text2url.user.js"),
  banner: {
    js: await readMetadataBanner()
  }
});
