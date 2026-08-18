import { PortfolioStudio } from "../components/PortfolioStudio";
import { listInquiries } from "../../db/inquiry-repository";
import { readPortfolio } from "../../db/portfolio-repository";
import { requireAdminPage } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  await requireAdminPage("/studio");
  const [portfolio, inquiries] = await Promise.all([readPortfolio(), listInquiries()]);
  return <PortfolioStudio initialData={portfolio} initialInquiries={inquiries} />;
}
