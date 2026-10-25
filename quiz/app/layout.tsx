import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מי ענה?",
  description: "משחק משפחתי לסופ״ש",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1f2a44" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
