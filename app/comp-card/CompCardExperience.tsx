"use client";

import { useEffect } from "react";
import { DigitalCompCard } from "../components/DigitalCompCard";
import { HarftAttribution } from "../components/HarftAttribution";
import { analyticsEvents, trackEvent } from "../../lib/analytics";
import type { PortfolioData } from "../../lib/portfolio";

export function CompCardExperience({ data }: { data: PortfolioData }) {
  useEffect(() => { void trackEvent(analyticsEvents.compCardView); }, []);
  return (
    <main className="platform-page">
      <DigitalCompCard data={data} />
      <HarftAttribution tone="light" />
    </main>
  );
}
