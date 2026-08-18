import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Studio",
  robots: { index: false, follow: false },
};

export default function ExportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
