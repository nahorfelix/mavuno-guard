import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mavuno Guard | Farm Risk Intelligence",
  description: "Farm risk intelligence for weather, trees, and field operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
