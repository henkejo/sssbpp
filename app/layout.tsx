import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSSB++",
  description: "SSSB apartment queue data scraper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

