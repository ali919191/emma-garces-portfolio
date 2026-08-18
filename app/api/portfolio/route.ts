import { env } from "cloudflare:workers";
import { defaultPortfolio, type PortfolioData } from "../../../lib/portfolio";

type RuntimeEnv = { DB: D1Database };

async function database() {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error("Portfolio database binding is unavailable.");
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS portfolio_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS media_objects (
      key TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_media_objects_created_at ON media_objects(created_at)"),
  ]);
  return db;
}

export async function GET() {
  try {
    const db = await database();
    const row = await db.prepare("SELECT data, updated_at AS updatedAt FROM portfolio_state WHERE id = ?").bind(1).first<{ data: string; updatedAt: string }>();
    if (!row) {
      const serialized = JSON.stringify(defaultPortfolio);
      await db.prepare("INSERT INTO portfolio_state (id, data) VALUES (?, ?)").bind(1, serialized).run();
      return Response.json({ portfolio: defaultPortfolio, updatedAt: null });
    }
    return Response.json({ portfolio: JSON.parse(row.data) as PortfolioData, updatedAt: row.updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the portfolio." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const portfolio = (await request.json()) as PortfolioData;
    if (!portfolio?.profile || !Array.isArray(portfolio.credits) || !Array.isArray(portfolio.media)) {
      return Response.json({ error: "Invalid portfolio data." }, { status: 400 });
    }
    const serialized = JSON.stringify(portfolio);
    if (serialized.length > 1_500_000) return Response.json({ error: "Portfolio metadata is too large." }, { status: 413 });
    const db = await database();
    await db.prepare(`INSERT INTO portfolio_state (id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`)
      .bind(1, serialized).run();
    await db.prepare("PRAGMA optimize").run();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save the portfolio." }, { status: 500 });
  }
}
