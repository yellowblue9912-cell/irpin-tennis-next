import type { Metadata } from "next";
import Link from "next/link";
import RatingCalculator from "@/components/RatingCalculator";

export const metadata: Metadata = {
  title: "Як розраховується рейтинг | Irpin Tennis",
  description:
    "Прості правила рейтингу Irpin Tennis: останні 30 матчів, сила суперника, результат, різниця геймів і калькулятор зміни рейтингу.",
  alternates: { canonical: "/rating" },
};

const factors = [
  {
    number: "01",
    title: "Рейтинг суперника",
    text: "Перемога над сильнішим суперником дає більше, а поразка від слабшого забирає більше.",
  },
  {
    number: "02",
    title: "Перемога або поразка",
    text: "Система порівнює фактичний результат матчу з результатом, якого очікувала за рейтингами.",
  },
  {
    number: "03",
    title: "Різниця геймів",
    text: "Переконливий рахунок підсилює зміну. Коефіцієнт рахунку не може бути більшим за 1,5.",
  },
  {
    number: "04",
    title: "Останні 30 матчів",
    text: "У поточному рейтингу враховуються лише 30 найновіших рейтингових результатів гравця.",
  },
];

export default function RatingPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#123f2d]">
      <section className="bg-[#123f2d] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d7f34c]">
              Рейтинг Irpin Tennis
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
              Рейтинг визначають матчі, а не суб’єктивна оцінка
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              Система автоматично оцінює кожен результат: з ким ви грали,
              хто переміг і наскільки рівним був рахунок. Усі матчі
              обробляються за однаковою формулою.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat value="30" label="останніх матчів" />
            <Stat value="0,05" label="базовий крок" />
            <Stat value="×1,5" label="максимум за рахунок" />
            <Stat value="1–7" label="межі рейтингу" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad4529]">
            Що впливає
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Чотири складові рейтингу
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {factors.map((factor) => (
              <article
                key={factor.number}
                className="rounded-[26px] bg-white p-6 shadow-sm"
              >
                <span className="text-sm font-black text-[#ad4529]">
                  {factor.number}
                </span>
                <h3 className="mt-5 text-xl font-black">{factor.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#123f2d]/65">
                  {factor.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] bg-[#bb5a3c] p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
              Простими словами
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Як система оцінює один матч
            </h2>
            <ol className="mt-7 space-y-5">
              <Step number="1" text="Бере рейтинги обох гравців перед матчем." />
              <Step number="2" text="Розраховує, чия перемога була більш очікуваною." />
              <Step number="3" text="Порівнює прогноз із фактичним переможцем." />
              <Step number="4" text="Підсилює зміну відповідно до різниці геймів." />
              <Step number="5" text="Записує результат у хронологію кожного гравця." />
            </ol>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad4529]">
              Формула
            </p>
            <h2 className="mt-3 text-3xl font-black">Звідки береться зміна</h2>
            <div className="mt-6 rounded-2xl bg-[#123f2d] p-5 font-mono text-sm leading-7 text-white sm:text-base">
              зміна = 0,05 × (результат − очікування) × коефіцієнт рахунку
            </div>
            <div className="mt-6 space-y-4 text-sm leading-6 text-[#123f2d]/70 sm:text-base sm:leading-7">
              <p>
                <strong className="text-[#123f2d]">Результат</strong> — 1 для
                переможця та 0 для гравця, який програв.
              </p>
              <p>
                <strong className="text-[#123f2d]">Очікування</strong> —
                математична ймовірність перемоги на основі рейтингів обох
                гравців. Для рівних рейтингів вона становить 50%.
              </p>
              <p>
                <strong className="text-[#123f2d]">Коефіцієнт рахунку</strong>
                — від 1 до 1,5. Що більшою є частка різниці геймів у матчі, то
                сильніший вплив результату.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <RatingCalculator />
        </section>

        <section className="mt-12 rounded-[30px] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad4529]">
                Важливо
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Чому порядок матчів має значення
              </h2>
              <p className="mt-4 leading-7 text-[#123f2d]/70">
                Рейтинг кожного наступного матчу розраховується за рейтингами,
                які гравці мали перед ним. Тому матчі обробляються за датою, а
                не за порядком їх додавання на сайт.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f7f1e7] p-5 sm:p-6">
              <h3 className="text-xl font-black">Правило 30 матчів</h3>
              <p className="mt-3 leading-7 text-[#123f2d]/70">
                Поточне значення — це базовий рейтинг плюс зміни за останні 30
                матчів. Коли з’являється 31-й результат, найстаріший перестає
                враховуватися. Через це фактична зміна загального рейтингу може
                відрізнятися від внеску одного нового матчу.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-5 rounded-[30px] bg-[#d7f34c] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">
              Подивіться рейтинг у дії
            </h2>
            <p className="mt-2 text-[#123f2d]/70">
              У профілі видно суперника, рейтинг до матчу та зміну після нього.
            </p>
          </div>
          <Link
            href="/players"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-4 font-black text-white transition hover:bg-[#ad4529]"
          >
            Переглянути гравців →
          </Link>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-2xl font-black text-[#d7f34c] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7f34c] text-sm font-black text-[#123f2d]">
        {number}
      </span>
      <span className="pt-1 text-sm font-bold leading-6 text-white/85 sm:text-base">
        {text}
      </span>
    </li>
  );
}
