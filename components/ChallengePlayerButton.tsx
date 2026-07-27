"use client";

import Link from "next/link";
import { useState } from "react";

type ChallengePlayerButtonProps = {
  targetPlayerId: string;
  targetPlayerName: string;
  isAuthenticated: boolean;
  currentPlayerId: string | null;
  targetCanReceiveChallenge: boolean;
};

export default function ChallengePlayerButton({
  targetPlayerId,
  targetPlayerName,
  isAuthenticated,
  currentPlayerId,
  targetCanReceiveChallenge,
}: ChallengePlayerButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  if (currentPlayerId === targetPlayerId) {
    return (
      <Link
        href="/account"
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/25 px-4 py-2 text-xs font-black text-white transition hover:bg-white/10 sm:min-h-12 sm:px-5 sm:text-sm"
      >
        Мої рейтингові матчі
      </Link>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c6f13d] px-4 py-2 text-xs font-black text-[#123f2d] transition hover:bg-white sm:min-h-12 sm:px-5 sm:text-sm"
      >
        Кинути виклик на рейтинговий матч
      </Link>
    );
  }

  if (!currentPlayerId) {
    return (
      <Link
        href="/account"
        className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c6f13d] px-4 py-2 text-center text-xs font-black text-[#123f2d] transition hover:bg-white sm:min-h-12 sm:px-5 sm:text-sm"
      >
        Прив’язати профіль, щоб кинути виклик
      </Link>
    );
  }

  if (!targetCanReceiveChallenge) {
    return (
      <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-center text-xs font-bold text-white/60 sm:min-h-12 sm:px-5 sm:text-sm">
        Гравець ще не приймає виклики
      </span>
    );
  }

  async function createChallenge() {
    setBusy(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/rating-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          opponentId: targetPlayerId,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Не вдалося надіслати виклик.");
        return;
      }

      setSuccess(true);
      setMessage(`Виклик для ${targetPlayerName} надіслано.`);
    } catch {
      setMessage("Не вдалося надіслати виклик. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col items-start gap-2">
      {success ? (
        <Link
          href="/account"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c6f13d] px-4 py-2 text-xs font-black text-[#123f2d] transition hover:bg-white sm:min-h-12 sm:px-5 sm:text-sm"
        >
          Перейти до викликів у кабінеті
        </Link>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={createChallenge}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#c6f13d] px-4 py-2 text-xs font-black text-[#123f2d] transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:min-h-12 sm:px-5 sm:text-sm"
        >
          {busy ? "Надсилаємо виклик…" : "Кинути виклик на рейтинговий матч"}
        </button>
      )}

      {message && (
        <p
          aria-live="polite"
          className={`text-xs font-bold sm:text-sm ${
            success ? "text-[#c6f13d]" : "text-[#ffd0c5]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
