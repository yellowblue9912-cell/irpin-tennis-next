import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тенісні ліги в Ірпені | Irpin Tennis",
  description:
    "Masters, Challenger і ліга для дівчат: активні сезони, учасники, турнірні таблиці, матчі та результати.",
  alternates: { canonical: "/league" },
};

const leagues = [
  {
    name: "Masters",
    slug: "masters",
    label: "Найвищий дивізіон",
    rating: "3.75–5.0",
    description:
      "Ліга для сильних і досвідчених гравців, які регулярно проводять матчі та готові грати у високому темпі.",
    purpose:
      "Мета ліги — об’єднати найсильніших учасників спільноти та створити конкурентні матчі найвищого рівня.",
    features: [
      "Сильні та досвідчені суперники",
      "Високий темп і рівень матчів",
      "Боротьба за лідерство в рейтингу",
    ],
    accent: "bg-[#bb5a3c]",
    button: "bg-[#f6f0e5] text-[#123f2d]",
  },
  {
    name: "Challenger",
    slug: "challenger",
    label: "Ліга розвитку",
    rating: "3.0–3.75",
    description:
      "Ліга для активних аматорів, які хочуть частіше грати, набиратися досвіду та поступово підвищувати свій рівень.",
    purpose:
      "Мета ліги — допомогти гравцям розвиватися через регулярні матчі з рівними суперниками.",
    features: [
      "Регулярна ігрова практика",
      "Суперники приблизно одного рівня",
      "Можливість перейти до Masters",
    ],
    accent: "bg-[#d7f34c]",
    button: "bg-[#123f2d] text-white",
  },
  {
    name: "Ladies",
    slug: "ladies",
    label: "Ліга для дівчат",
    rating: "Усі рівні",
    description:
      "Окрема тенісна ліга для дівчат, де можна знайти суперниць свого рівня, грати матчі та брати участь у турнірах.",
    purpose:
      "Мета ліги — розвивати теніс серед дівчат у нашій спільноті та створювати дружню, але конкурентну атмосферу.",
    features: [
      "Матчі між гравчинями різного рівня",
      "Окремий рейтинг ліги",
      "Турніри та зустрічі для дівчат",
    ],
    accent: "bg-[#e8b4c8]",
    button: "bg-[#123f2d] text-white",
  },
];

export default function LeaguePage() {
  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="relative overflow-hidden bg-[#123f2d] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[45px] border-[#d7f34c]/10" />

        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full border-[24px] border-white/5" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-5 md:py-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#d7f34c]">
            Irpin Tennis Leagues
          </p>

          <h1 className="mt-4 max-w-4xl text-3xl font-black uppercase leading-[0.95] sm:text-4xl md:mt-5 md:text-7xl">
            Наші тенісні ліги
          </h1>

          <p className="mt-4 hidden max-w-3xl text-sm leading-6 text-white/70 sm:text-base md:leading-8">
            Оберіть лігу відповідно до свого рівня та цілей. Кожна ліга
            допомагає знаходити рівних суперників, регулярно грати матчі та
            розвиватися разом із тенісною спільнотою.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
              3 ліги
            </div>

            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
              Рівні від 3.0 до 5.0
            </div>

            <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold">
              Регулярні матчі
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-6 sm:px-5 md:py-8">
        <div className="mb-5 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#bb5a3c]">
            Оберіть свій формат
          </p>

          <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl md:text-5xl">
            Три ліги для різних гравців
          </h2>

          <p className="hidden">
            Ліги створені для того, щоб матчі були рівними, цікавими та
            корисними для прогресу кожного учасника.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
          {leagues.map((league, index) => (
            <article
              key={league.slug}
              className="group flex min-h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-[32px]"
            >
              <div className={`${league.accent} p-4 sm:p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#123f2d]/65">
                    Ліга {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#123f2d]">
                    {league.slug === "masters"
                      ? "3.5+"
                      : league.slug === "challenger"
                        ? "3.0–3.5"
                        : "Для дівчат"}
                  </span>
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#123f2d]/60">
                  {league.label}
                </p>

                <h2 className="mt-1 text-3xl font-black uppercase text-[#123f2d]">
                  {league.name}
                </h2>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="line-clamp-3 text-sm leading-6 text-[#123f2d]/70">
                  {league.description}
                </p>

                <div className="hidden">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb5a3c]">
                    Для чого ця ліга
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#123f2d]/70">
                    {league.purpose}
                  </p>
                </div>

                <ul className="hidden">
                  {league.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm font-bold leading-6 text-[#123f2d]/75"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#bb5a3c]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/league/${league.slug}`}
                  className={`mt-4 inline-flex items-center justify-between rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.08em] transition hover:scale-[1.02] ${league.button}`}
                  style={{
                    color:
                      league.slug === "masters" ? "#123f2d" : "#ffffff",
                  }}
                >
                  <span>Переглянути лігу</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hidden">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#d7f34c]">
                Як обрати лігу
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
                Орієнтуйся на свій поточний рівень
              </h2>

              <p className="mt-5 text-lg leading-8 text-white/65">
                Найкраща ліга — та, де більшість матчів проходить у рівній
                боротьбі. Якщо ти постійно перемагаєш або програєш із великим
                рахунком, можливо, варто перейти до іншого дивізіону.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <strong className="text-3xl font-black text-[#d7f34c]">
                  3.0–3.75
                </strong>

                <p className="mt-3 text-sm font-black uppercase tracking-wide">
                  Challenger
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Для розвитку та регулярної практики.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <strong className="text-3xl font-black text-[#d7f34c]">
                  3.75–5.0
                </strong>

                <p className="mt-3 text-sm font-black uppercase tracking-wide">
                  Masters
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Для найсильніших учасників.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <strong className="text-3xl font-black text-[#e8b4c8]">
                  Усі рівні
                </strong>

                <p className="mt-3 text-sm font-black uppercase tracking-wide">
                  Ladies
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Тенісна спільнота для дівчат.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="rounded-[34px] bg-[#bb5a3c] px-7 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/60">
                Не впевнений у своєму рівні?
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
                Переглянь рейтингову систему
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/75">
                Опис рівнів допоможе зрозуміти, яка ліга найбільше відповідає
                твоїй поточній грі.
              </p>
            </div>

            <Link
              href="/rating"
              className="inline-flex justify-center rounded-full bg-[#d7f34c] px-7 py-4 text-sm font-black uppercase tracking-wide text-[#123f2d] transition hover:scale-105"
            >
              Переглянути рівні
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
