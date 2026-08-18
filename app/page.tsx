import { PublicPortfolio } from "./components/PublicPortfolio";
import { readPortfolio } from "../db/portfolio-repository";
import { toPublicPortfolio } from "../lib/portfolio";
import { publicStructuredData } from "../lib/structured-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = toPublicPortfolio(await readPortfolio());
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(publicStructuredData(data)).replace(/</g, "\\u003c") }} />
      <PublicPortfolio initialData={data} />
    </>
  );
}
