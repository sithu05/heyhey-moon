import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import { AppShell } from "../shared/components/layout";
import { Toaster } from "./sonner";

export const metadata: Metadata = {
  title: "Zello Admin",
  description: "Zello admin portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Toaster />

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
