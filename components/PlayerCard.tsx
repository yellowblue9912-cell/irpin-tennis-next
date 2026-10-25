import RatingInactivityHelp from "./RatingInactivityHelp";
import Link from "next/link";
import type { Player } from "@/types/player";

type Props = {
  player: Player;
  position: number;
};

function getPosition(position: number) {
  return `#${position}`;
}

export default function PlayerCard({ player, position }: Props) {
  const firstLetter = player.name.charAt(0).toUpperCase();

  return (
    <div
      className="glass-card group relative grid grid-cols-[42px_54px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-2xl border-white/10 backdrop-blur-md p-3 transition duration-300 hover:-translate-y-1 md:grid-cols-[70px_82px_1fr_auto_40px] md:gap-4 md:rounded-[26px] md:p-5"
    >
      <Link href={`/players/${player.slug}`} aria-label={`Профіль гравця: ${player.name}`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2" />
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f2d] text-xs font-black text-white md:h-14 md:w-14 md:text-base">
        {getPosition(position)}
      </div>

      <div className="relative h-[52px] w-[52px] overflow-hidden rounded-xl border-[3px] border-[#d7f34c] bg-[#eef3e8] md:h-20 md:w-20 md:rounded-2xl md:border-4">
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={player.name}
            className="h-full w-full object-contain p-0.5"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
            {firstLetter}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-sm font-black text-[#123f2d] transition group-hover:text-[#ad4529] sm:text-base md:text-xl">
          {player.name}
        </h2>

        <div className="mt-2 hidden flex-wrap gap-2 md:flex">
          <span className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-bold text-[#123f2d]/60">
            Переглянути статистику та матчі
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-2"><strong className="block text-xl font-black text-[#123f2d] md:text-3xl">
          {player.rating.toFixed(2)}
        </strong><RatingInactivityHelp /></div>

        <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[#123f2d]/40 md:block">
          Рейтинг
        </span>
      </div>

      <div className="hidden text-2xl text-[#123f2d] transition group-hover:translate-x-1 md:block">
        →
      </div>
    </div>
  );
}
