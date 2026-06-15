import "./globals.css";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { Toaster } from "@/shared/components/sonner";
import { AppShell } from "@/shared/components/ui/app-shell";

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
