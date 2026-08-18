import { PublicPortfolio } from "./components/PublicPortfolio";
import { readPortfolio } from "../db/portfolio-repository";
import { toPublicPortfolio } from "../lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <PublicPortfolio initialData={toPublicPortfolio(await readPortfolio())} />;
}
