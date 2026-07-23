import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "IRPIN TENNIS",
  description:
    "Тенісна спільнота Ірпеня: гравці, турніри, ліги, корти та рейтингова система.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-slate-50 text-[#123f2d] antialiased">
        <Header />
        <Breadcrumbs />
        <main>{children}</main>
      </body>
    </html>
  );
}