import type { Metadata, Viewport } from "next";
import "./globals.css";
import HapticMount from "@/components/HapticMount";

export const metadata: Metadata = {
  title: "City Match — Find Your City",
  description:
    "Answer a few questions and discover which global city matches your lifestyle. NYC, Tokyo, Amsterdam, Los Angeles, Vienna, or Singapore?",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <HapticMount />
        {children}
      </body>
    </html>
  );
}
