import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export function generateMetadata(): Metadata {
  const siteUrl = process.env.SITE_URL ?? "https://www.emmagarces.com";
  const title = process.env.SITE_TITLE ?? "Emma Garces — International Runway Model";
  const description = process.env.SITE_DESCRIPTION ?? "The official portfolio and international booking profile of runway model Emma Garces.";
  const image = process.env.SOCIAL_IMAGE_PATH ?? "/og.png";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s" },
    description,
    alternates: { canonical: "/" },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website", url: "/", siteName: "Emma Garces", images: [{ url: image, width: 1731, height: 909, alt: "Emma Garces — International Runway Model" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script id="vercel-analytics">{`window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};`}</Script>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
