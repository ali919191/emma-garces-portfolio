import { revalidatePath } from "next/cache";
import { readPortfolio, savePortfolio } from "../../../db/portfolio-repository";
import { requireAdminApi } from "../../../lib/auth";
import { isPortfolioData, toPublicPortfolio } from "../../../lib/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portfolio = await readPortfolio();
    const isAdmin = await requireAdminApi();
    return Response.json({ portfolio: isAdmin ? portfolio : toPublicPortfolio(portfolio) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the portfolio." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdminApi())) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 1_500_000) return Response.json({ error: "Portfolio metadata is too large." }, { status: 413 });
    const portfolio: unknown = await request.json();
    if (!isPortfolioData(portfolio)) return Response.json({ error: "Invalid portfolio data." }, { status: 400 });
    await savePortfolio(portfolio);
    revalidatePath("/");
    revalidatePath("/studio");
    revalidatePath("/exports");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save the portfolio." }, { status: 500 });
  }
}
