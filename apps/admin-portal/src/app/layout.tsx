import "./globals.css";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

import { Toaster } from "@/shared/components/sonner";

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
      <body className={publicSans.className}>
        <Toaster />

        {children}
      </body>
    </html>
  );
}
