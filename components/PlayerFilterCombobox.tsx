"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FilterPlayer = {
  id: string;
  name: string;
};

function normalize(value: string) {
  return value.toLocaleLowerCase("uk-UA").replace(/\s+/g, " ").trim();
}

export default function PlayerFilterCombobox({
  players,
  selectedId,
}: {
  players: FilterPlayer[];
  selectedId: string;
}) {
  const selectedPlayer = players.find((player) => player.id === selectedId);
  const [query, setQuery] = useState(selectedPlayer?.name ?? "");
  const [value, setValue] = useState(selectedPlayer?.id ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    const matchingPlayers = normalizedQuery
      ? players.filter((player) =>
          normalize(player.name).includes(normalizedQuery),
        )
      : players;

    return matchingPlayers.slice(0, 8);
  }, [players, query]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function choosePlayer(player: FilterPlayer) {
    setQuery(player.name);
    setValue(player.id);
    setOpen(false);
  }

  function clearPlayer() {
    setQuery("");
    setValue("");
    setOpen(true);
  }

  function chooseAllPlayers() {
    setQuery("");
    setValue("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative grid gap-2">
      <label
        htmlFor="matches-player-search"
        className="text-sm font-black uppercase tracking-wide"
      >
        Гравець
      </label>
      <input type="hidden" name="player" value={value} readOnly />
      <div className="relative">
        <input
          id="matches-player-search"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="matches-player-options"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="Введіть ім’я гравця"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setValue("");
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && open && results.length > 0) {
              event.preventDefault();
              choosePlayer(results[0]);
            }
          }}
          className="w-full min-w-0 rounded-2xl border border-[#123f2d]/15 bg-[#f7f1e7] px-4 py-3 pr-11 text-base font-semibold normal-case outline-none placeholder:text-[#123f2d]/35 focus:border-[#123f2d]"
        />
        {query && (
          <button
            type="button"
            onClick={clearPlayer}
            aria-label="Очистити вибір гравця"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-lg font-black text-[#123f2d]/45 hover:bg-[#123f2d]/10 hover:text-[#123f2d]"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          id="matches-player-options"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#123f2d]/10 bg-white p-2 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={chooseAllPlayers}
            className="w-full rounded-xl px-3 py-2.5 text-left font-bold text-[#123f2d]/55 hover:bg-[#f7f1e7]"
          >
            Усі гравці
          </button>
          {results.map((player) => (
            <button
              key={player.id}
              type="button"
              role="option"
              aria-selected={value === player.id}
              onClick={() => choosePlayer(player)}
              className={`w-full rounded-xl px-3 py-2.5 text-left font-bold transition hover:bg-[#f7f1e7] ${
                value === player.id
                  ? "bg-[#123f2d] text-white hover:bg-[#123f2d]"
                  : "text-[#123f2d]"
              }`}
            >
              {player.name}
            </button>
          ))}
          {query && results.length === 0 && (
            <p className="px-3 py-4 text-sm font-semibold text-[#123f2d]/50">
              Гравців з таким ім’ям не знайдено.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
