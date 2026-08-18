import { put } from "@vercel/blob";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { replaceMediaStorageKey } from "../../db/portfolio-repository";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const pathname = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(pathname) : [pathname];
  }));
  return nested.flat();
}

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".mov": "video/quicktime", ".mp4": "video/mp4", ".webm": "video/webm",
};

const directoryArg = argument("--directory");
if (!directoryArg) throw new Error("Usage: pnpm migrate:r2 -- --directory ./r2-export [--map ./blob-map.json]");
const directory = resolve(directoryArg);
const map: Record<string, string> = {};

for (const file of await filesUnder(directory)) {
  const oldKey = relative(directory, file).split(sep).join("/");
  const contentType = mimeTypes[extname(file).toLowerCase()] ?? "application/octet-stream";
  const info = await stat(file);
  const uploaded = await put(`portfolio/${oldKey}`, await readFile(file), { access: "private", contentType, addRandomSuffix: true, multipart: info.size > 4 * 1024 * 1024 });
  await replaceMediaStorageKey(oldKey, uploaded.pathname, contentType, info.size);
  map[oldKey] = uploaded.pathname;
  console.log(`${oldKey} -> ${uploaded.pathname}`);
}

const mapPath = argument("--map");
if (mapPath) await writeFile(resolve(mapPath), `${JSON.stringify(map, null, 2)}\n`, "utf8");
console.log(`Migrated ${Object.keys(map).length} R2 objects to private Vercel Blob storage.`);
