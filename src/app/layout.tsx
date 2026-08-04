import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Account Marketplace",
  description: "Jual beli akun game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
