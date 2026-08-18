import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { savePortfolio } from "../../db/portfolio-repository";
import { isPortfolioData, type PortfolioData } from "../../lib/portfolio";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function unwrapD1Export(value: unknown): unknown {
  if (isPortfolioData(value)) return value;
  if (Array.isArray(value)) return value.length === 1 ? unwrapD1Export(value[0]) : value;
  if (!value || typeof value !== "object") return value;
  const row = value as Record<string, unknown>;
  if (typeof row.data === "string") return JSON.parse(row.data);
  if (row.results) return unwrapD1Export(row.results);
  if (row.portfolio) return unwrapD1Export(row.portfolio);
  return value;
}

const source = argument("--portfolio");
if (!source) throw new Error("Usage: pnpm migrate:d1 -- --portfolio ./portfolio.json [--media-metadata ./media.json]");

const raw = JSON.parse(await readFile(resolve(source), "utf8"));
const parsed = unwrapD1Export(raw);
if (!isPortfolioData(parsed)) throw new Error("The export is not a recognized PortfolioData or D1 portfolio row.");

const portfolio = structuredClone(parsed) as PortfolioData;
const metadataPath = argument("--media-metadata");
if (metadataPath) {
  const metadata = JSON.parse(await readFile(resolve(metadataPath), "utf8")) as Record<string, { mimeType?: string; size?: number }>;
  portfolio.media = portfolio.media.map((asset) => ({ ...asset, ...metadata[asset.key] }));
}

await savePortfolio(portfolio);
console.log(`Imported ${portfolio.credits.length} credits, ${portfolio.media.length} media records, and ${portfolio.videos.length} videos into Neon.`);
