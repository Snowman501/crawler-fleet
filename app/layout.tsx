import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://questforgeai.vercel.app"),
  title: "Crawler Fleet | Free Website Checkup",
  description:
    "Free evidence-based website checkups for small business SEO, trust signals, lead capture, and conversion basics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
