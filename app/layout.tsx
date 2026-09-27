import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";
import "./market-mobile.css";

export const metadata: Metadata = {
  title: "StacksClub — The social market for stocks and Stacks.",
  description: "Explore tokenized stocks on BNB Chain, compare providers, and build a point of view with StacksClub.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
