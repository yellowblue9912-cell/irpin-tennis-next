"use client";

import { useState } from "react";

type Season = { id: string; title: string; is_active: boolean };
type Player = { id: string; name: string; rating: number | string | null };
type Membership = { season_id: string; player_id: string };

export default function LeagueMatchFields({ seasons, players, memberships, initialSeasonId, today }: {
  seasons: Season[];
  players: Player[];
  memberships: Membership[];
  initialSeasonId: string;
  today: string;
}) {
  const [seasonId, setSeasonId] = useState(initialSeasonId);
  const [playerIds, setPlayerIds] = useState(["", ""]);
  const members = new Set(memberships.filter((row) => row.season_id === seasonId).map((row) => row.player_id));
  const leaguePlayers = players.filter((player) => members.has(player.id));
  const inputClass = "mt-2 w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 normal-case outline-none focus:border-[#123f2d] disabled:opacity-50";

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm font-black uppercase tracking-wide">
          Ліга та сезон
          <select name="season_id" required value={seasonId} className={inputClass}
            onChange={(event) => {
              const nextSeason = event.target.value;
              // Clear scores and notes too, so a result cannot carry over to another league.
              event.currentTarget.form?.reset();
              setSeasonId(nextSeason);
              setPlayerIds(["", ""]);
            }}>
            <option value="" disabled>Оберіть сезон</option>
            {[true, false].map((active) => (
              <optgroup key={String(active)} label={active ? "Активні ліги" : "Завершені сезони"}>
                {seasons.filter((season) => season.is_active === active).map((season) => (
                  <option key={season.id} value={season.id}>{season.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block text-sm font-black uppercase tracking-wide">
          Дата матчу
          <input name="played_at" type="date" required defaultValue={today} className={inputClass} />
        </label>
      </div>
      <p className="mt-4 text-sm text-[#123f2d]/65" role="status">
        {seasonId ? `У складі ліги: ${leaguePlayers.length}. Оберіть двох учасників.` : "Спочатку оберіть лігу — потім з’явиться її склад."}
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {["player1_id", "player2_id"].map((name, index) => (
          <label key={name} className="block text-sm font-black uppercase tracking-wide">
            Гравець {index + 1}
            <select name={name} required value={playerIds[index]} disabled={!seasonId || leaguePlayers.length < 2}
              className={inputClass}
              onChange={(event) => setPlayerIds((current) => current.map((value, i) => i === index ? event.target.value : value))}>
              <option value="" disabled>{seasonId ? "Оберіть гравця" : "Спочатку оберіть лігу"}</option>
              {leaguePlayers.map((player) => (
                <option key={player.id} value={player.id} disabled={player.id === playerIds[1 - index]}>
                  {player.name} · {Number(player.rating ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </>
  );
}
