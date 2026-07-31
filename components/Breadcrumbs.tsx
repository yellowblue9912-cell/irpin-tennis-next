"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const names: Record<string, string> = {
  players: "Гравці",
  tournaments: "Турніри",
  matches: "Останні матчі",
  courts: "Корти",
  rating: "Як працює рейтинг",
  league: "Ліги",
  coaches: "Тренери",
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
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length !== 2 || segments[0] !== "players") return;

    const slug = segments[1];
    if (playerNames[slug]) return;

    const controller = new AbortController();

    fetch(`/api/breadcrumbs/players/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { name?: string } | null) => {
        if (!data?.name) return;
        setPlayerNames((current) => ({ ...current, [slug]: data.name! }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Breadcrumb player name error:", error);
      });

    return () => controller.abort();
  }, [pathname, playerNames]);

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
          const isPlayerProfile =
            segments.length === 2 && segments[0] === "players" && index === 1;
          const label = isPlayerProfile
            ? playerNames[segment] ?? "Профіль гравця"
            : getName(segment);

          return (
            <div key={href} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>

              {last ? (
                <span className="font-semibold text-[#ad4529]">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="font-semibold text-[#123f2d] hover:text-[#ad4529]"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
