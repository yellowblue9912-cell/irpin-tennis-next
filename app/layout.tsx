import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.irpintennis.com"),
  title: "Теніс в Ірпені, Бучі та Києві | Irpin Tennis",
  description:
    "Тенісна спільнота Ірпеня, Бучі та Києва: гравці, турніри, активні ліги, корти, тренери та результати матчів.",
  openGraph: {
    title: "Теніс в Ірпені, Бучі та Києві | Irpin Tennis",
    description:
      "Гравці, турніри, ліги, корти й тренери тенісної спільноти Irpin Tennis.",
    url: "/",
    siteName: "Irpin Tennis",
    locale: "uk_UA",
    type: "website",
  },
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
