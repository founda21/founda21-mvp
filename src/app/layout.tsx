import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founda21 — The Founder Readiness Standard",
  description:
    "From a raw idea to a startup that's actually ready. The Founder Readiness Standard · South Africa First.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
