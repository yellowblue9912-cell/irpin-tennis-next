import Link from "next/link";
import type { Player } from "@/types/player";

type Props = {
  player: Player;
  position: number;
};

function getPosition(position: number) {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";

  return `#${position}`;
}

export default function PlayerCard({ player, position }: Props) {
  const firstLetter = player.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/players/${player.slug}`}
      className="group grid items-center gap-4 rounded-[26px] border border-[#123f2d]/10 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[70px_82px_1fr_auto_40px] md:p-5"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#123f2d] text-base font-black text-white">
        {getPosition(position)}
      </div>

      <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-[#d7f34c] bg-[#eef3e8]">
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
        <h2 className="truncate text-xl font-black text-[#123f2d] transition group-hover:text-[#ad4529]">
          {player.name}
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-bold text-[#123f2d]/60">
            Переглянути статистику й досягнення
          </span>
        </div>
      </div>

      <div className="text-left md:text-right">
        <strong className="block text-3xl font-black text-[#123f2d]">
          {player.rating.toFixed(2)}
        </strong>

        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#123f2d]/40">
          Рейтинг
        </span>
      </div>

      <div className="hidden text-2xl text-[#123f2d] transition group-hover:translate-x-1 md:block">
        →
      </div>
    </Link>
  );
}
