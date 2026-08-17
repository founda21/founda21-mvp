import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://founda21.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Founda21 — Independent Readiness Assessment for African Ventures",
  description:
    "We assess your ventures against 21 fixed checkpoints and give you a written report on each one. Independent third-party assessment, not a decision-maker, no equity taken.",
  openGraph: {
    title: "Founda21 — Independent Readiness Assessment for African Ventures",
    description:
      "We assess your ventures against 21 fixed checkpoints and give you a written report on each one.",
    url: SITE_URL,
    siteName: "Founda21",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Founda21 — Independent Readiness Assessment for African Ventures",
    description:
      "We assess your ventures against 21 fixed checkpoints and give you a written report on each one.",
  },
};

// Organization/Service structured data — describes Founda21 as an
// independent third-party assessor (§ positioning brief), not a funder,
// investor, or decision-maker, matching the disclaimers shown on-page.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Founda21",
  url: SITE_URL,
  description:
    "Independent third-party venture-readiness assessment for early-stage African ventures. Assesses against 21 fixed checkpoints and delivers written reports to institutions.",
  slogan: "Independent readiness assessment for early-stage African ventures.",
  areaServed: "ZA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
