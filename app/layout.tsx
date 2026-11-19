import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Changelog | Bookchaowalit",
  description: "A small release-notes list kept in your browser.",
  keywords: ["changelog", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL("https://changelog.bookchaowalit.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Changelog | Bookchaowalit",
    description: "A small release-notes list kept in your browser.",
    siteName: "Bookchaowalit",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The font variable sits on <html>: the Reader shell tokens live on :root and read it from there.
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
