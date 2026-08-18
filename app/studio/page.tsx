import { PortfolioStudio } from "../components/PortfolioStudio";
import { readPortfolio } from "../../db/portfolio-repository";
import { requireAdminPage } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  await requireAdminPage("/studio");
  return <PortfolioStudio initialData={await readPortfolio()} />;
}
