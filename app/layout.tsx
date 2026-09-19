import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://questforgeai.vercel.app"),
  title: "SL NextGen Web Intel | Website Checkups",
  description:
    "Evidence-first website checkups for small business SEO, trust signals, lead capture, and launch readiness. Powered by Crawler Fleet.",
  applicationName: "SL NextGen Web Intel",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "SL NextGen Web Intel",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2362d1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
