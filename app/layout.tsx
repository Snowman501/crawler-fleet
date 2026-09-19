import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crawler Fleet Website Checkup",
  description: "Evidence-based one-page website checkups for technical, content, trust, and conversion basics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
