import Image from "next/image";
import type { Player } from "@/app/data/players";

type Props = {
  player: Player;
  position: number;
};

function getRatingLabel(rating: number) {
  if (rating >= 4.5) return "Елітний рівень";
  if (rating >= 4.0) return "Просунутий";
  if (rating >= 3.5) return "Сильний аматор";
  if (rating >= 3.25) return "Середній рівень";
  return "Аматор";
}

function getAchievementIcon(place: 1 | 2 | 3) {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  return "🥉";
}

export default function PlayerProfile({ player, position }: Props) {
  const firstLetter = player.name.charAt(0).toUpperCase();
  const achievements = player.achievements ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[38px] border-[#d7f34c]/10" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[180px_1fr_320px] md:items-center md:py-20">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-8 border-[#d7f34c] bg-white/10 shadow-2xl">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={player.name}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-black">
                {firstLetter}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d7f34c]">
              Профіль гравця
            </p>

            <h1 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">
              {player.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black">
                #{position} у рейтингу
              </span>

              <span className="rounded-full bg-[#d7f34c] px-4 py-2 text-sm font-black text-[#123f2d]">
                {getRatingLabel(player.rating)}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black">
                🏆 {achievements.length} досягнень
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/55">
              Поточний рейтинг
            </p>

            <div className="mt-3 flex items-end justify-between">
              <strong className="text-6xl font-black text-[#d7f34c]">
                {player.rating.toFixed(2)}
              </strong>

              <span className="rounded-full bg-white/10 px-4 py-2 font-black">
                #{position}
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#d7f34c]"
                style={{
                  width: `${Math.min(100, (player.rating / 5) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#123f2d]/45">
              Місце
            </p>
            <strong className="mt-3 block text-4xl font-black">
              #{position}
            </strong>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#123f2d]/45">
              Матчів
            </p>
            <strong className="mt-3 block text-4xl font-black">0</strong>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#123f2d]/45">
              Перемог
            </p>
            <strong className="mt-3 block text-4xl font-black">0</strong>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#123f2d]/45">
              Поразок
            </p>
            <strong className="mt-3 block text-4xl font-black">0</strong>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-[28px] bg-white p-7 shadow-sm">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
                Трофеї
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Досягнення
              </h2>
            </div>

            {achievements.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 rounded-[20px] bg-[#f6f0e5] p-4"
                  >
                    <div className="text-3xl">
                      {getAchievementIcon(achievement.place)}
                    </div>

                    <div>
                      <h3 className="font-black">
                        {achievement.tournament}
                      </h3>

                      <p className="mt-1 text-sm text-[#123f2d]/55">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[20px] border border-dashed border-[#123f2d]/20 bg-[#f6f0e5] px-6 py-10 text-center">
                <p className="font-bold">
                  Досягнень поки немає
                </p>

                <p className="mt-2 text-sm text-[#123f2d]/55">
                  Тут з’являться перемоги та призові місця у турнірах.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[28px] bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
                  Результати
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Історія матчів
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f34c] text-2xl">
                🎾
              </div>
            </div>

            <div className="mt-6 rounded-[20px] border border-dashed border-[#123f2d]/20 bg-[#f6f0e5] px-6 py-10 text-center">
              <p className="font-bold">
                Матчів поки немає
              </p>

              <p className="mt-2 text-sm text-[#123f2d]/55">
                Тут з’являться суперники, рахунок, дата матчу та зміна рейтингу.
              </p>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}