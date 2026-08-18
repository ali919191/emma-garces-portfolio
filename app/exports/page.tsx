import { ExportView, type ExportType } from "../components/ExportView";
import { readPortfolio } from "../../db/portfolio-repository";
import { requireAdminPage } from "../../lib/auth";

export const dynamic = "force-dynamic";

const exportTypes = new Set<ExportType>(["portfolio", "comp-card", "credits", "digitals", "dubai"]);

export default async function ExportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireAdminPage("/exports");
  const requested = (await searchParams).type as ExportType | undefined;
  const initialType = requested && exportTypes.has(requested) ? requested : "portfolio";
  return <ExportView initialData={await readPortfolio()} initialType={initialType} />;
}
