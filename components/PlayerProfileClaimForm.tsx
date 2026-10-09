"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlayerOption = { id: string; name: string; rating: number };

export default function PlayerProfileClaimForm({
  players,
}: {
  players: PlayerOption[];
}) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/player-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          requestedName: playerId ? "" : newName,
        }),
      });
      const result = await response.json();
      setMessage(result.message ?? result.error ?? "Не вдалося надіслати заявку.");
      if (response.ok) router.refresh();
    } catch {
      setMessage("Не вдалося надіслати заявку. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <label htmlFor="player-claim" className="mb-2 block text-sm font-black">
          Знайти свою картку гравця
        </label>
        <select
          id="player-claim"
          value={playerId}
          onChange={(event) => setPlayerId(event.target.value)}
          className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f7f1e7] px-4 py-3"
        >
          <option value="">Моєї картки немає у списку</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} · рейтинг {Number(player.rating).toFixed(2)}
            </option>
          ))}
        </select>
        {!playerId && (
          <div className="mt-4">
            <label htmlFor="new-player-name" className="mb-2 block text-sm font-black">
              Ім’я для нового профілю
            </label>
            <input
              id="new-player-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              placeholder="Ваше ім’я та прізвище"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f7f1e7] px-4 py-3"
            />
          </div>
        )}
        {message && <p role="status" className="mt-3 text-sm font-bold">{message}</p>}
      </div>
      <button
        type="submit"
        disabled={busy || (!playerId && newName.trim().length < 2)}
        className="rounded-2xl bg-[#123f2d] px-5 py-3 font-black text-white disabled:opacity-50"
      >
        {busy ? "Надсилаємо…" : "Надіслати заявку"}
      </button>
    </form>
  );
}
