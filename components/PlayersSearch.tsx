"use client";

import { useMemo, useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import { players } from "@/app/data/players";

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("uk-UA")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PlayersSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.rating - a.rating),
    [],
  );

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    if (!normalizedQuery) {
      return sortedPlayers;
    }

    return sortedPlayers.filter((player) => {
      const searchableText = normalizeText(
        [
          player.name,
          player.slug,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, sortedPlayers]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <div className="mb-7 rounded-[26px] bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label
              htmlFor="player-search"
              className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]"
            >
              Пошук гравця
            </label>

            <div className="relative mt-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#123f2d]/40"
              >
                <path
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="player-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Введіть ім’я або прізвище"
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-[#123f2d]/10 bg-[#f6f0e5] pl-12 pr-12 text-base font-bold text-[#123f2d] outline-none transition placeholder:font-medium placeholder:text-[#123f2d]/35 focus:border-[#bb5a3c] focus:ring-4 focus:ring-[#bb5a3c]/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Очистити пошук"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-xl font-bold text-[#123f2d]/50 transition hover:bg-[#123f2d]/10 hover:text-[#123f2d]"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#123f2d] px-5 py-3 text-sm font-bold text-white">
            Знайдено:
            <span className="ml-2 text-[#d7f34c]">
              {filteredPlayers.length}
            </span>
          </div>
        </div>
      </div>

      {filteredPlayers.length > 0 ? (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => {
            const globalPosition =
              sortedPlayers.findIndex(
                (sortedPlayer) => sortedPlayer.slug === player.slug,
              ) + 1;

            return (
              <PlayerCard
                key={player.slug}
                player={player}
                position={globalPosition}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f6f0e5] text-3xl">
            🎾
          </div>

          <h2 className="mt-5 text-2xl font-black">
            Гравців не знайдено
          </h2>

          <p className="mt-2 text-[#123f2d]/55">
            Спробуйте ввести інше ім’я або прізвище.
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-6 rounded-full bg-[#123f2d] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#0d3224]"
          >
            Очистити пошук
          </button>
        </div>
      )}
    </section>
  );
}