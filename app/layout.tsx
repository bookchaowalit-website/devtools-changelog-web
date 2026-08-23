import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Changelog | Bookchaowalit",
  description: "Product changelog without a CMS.",
  keywords: ["changelog", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL("https://bookchaowalit.com"),
  openGraph: {
    type: "website",
    title: "Changelog | Bookchaowalit",
    description: "Product changelog without a CMS.",
    siteName: "Bookchaowalit",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* THESIS: Changelog is a release queue. OWN-WORLD: black cracktro terminal, bitmap face, amber caret. STORY: grep, append, remove. FIRST VIEWPORT: show changed lines and local editing. FORM: seed 44f7e22c assigned cracktro queue direction. FINISH: sparse rules, honest browser-local persistence. */}
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
