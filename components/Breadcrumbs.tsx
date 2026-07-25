"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const names: Record<string, string> = {
  players: "Гравці",
  tournaments: "Турніри",
  courts: "Корти",
  rating: "Рейтинг",
  league: "Ліги",
  masters: "Masters",
  challenger: "Challenger",
  ladies: "Ladies",
  admin: "Адмін",
};

function getName(segment: string) {
  return (
    names[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-[#123f2d]/10 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm">
        <Link
          href="/"
          className="font-semibold text-[#123f2d] hover:text-[#ad4529]"
        >
          Головна
        </Link>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const last = index === segments.length - 1;

          return (
            <div key={href} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>

              {last ? (
                <span className="font-semibold text-[#ad4529]">
                  {getName(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="font-semibold text-[#123f2d] hover:text-[#ad4529]"
                >
                  {getName(segment)}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
