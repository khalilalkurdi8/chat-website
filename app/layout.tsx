import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A clearer way forward",
  description: "A focused landing page with instant support.",
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
