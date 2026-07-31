import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const src = readFileSync(fileURLToPath(new URL("../src/index.ts", import.meta.url)), "utf8");
const declared = src.match(/CONTRACTS_VERSION = "([^"]+)"/)?.[1];

if (declared !== pkg.version) {
  console.error(
    `contracts version mismatch: package.json is ${pkg.version}, ` +
    `src/index.ts declares ${declared}. They must match.`,
  );
  process.exit(1);
}
