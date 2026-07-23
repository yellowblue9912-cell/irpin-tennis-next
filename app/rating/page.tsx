import Link from "next/link";

const ratingLevels = [
  {
    level: "3.0",
    title: "Початковий рівень",
    points: [
      "Стабільно підтримує м’яч у грі.",
      "Виконує базову подачу.",
      "Добре знає правила та рахунок.",
      "Може самостійно провести повний матч.",
    ],
  },
  {
    level: "3.25",
    title: "Любитель, що прогресує",
    points: [
      "Контролює основні удари.",
      "Починає використовувати тактику.",
      "Допускає менше подвійних помилок.",
      "Впевненіше грає під тиском.",
    ],
  },
  {
    level: "3.5",
    title: "Впевнений аматор",
    points: [
      "Добре володіє форхендом та бекхендом.",
      "Може завершувати прості атаки.",
      "Вміє будувати розіграш.",
      "Регулярно перемагає гравців нижчих рівнів.",
    ],
  },
  {
    level: "3.75",
    title: "Сильний любитель",
    points: [
      "Має широкий набір ударів.",
      "Добре контролює темп гри.",
      "Допускає мінімум невимушених помилок.",
      "Добре читає гру суперника.",
    ],
  },
  {
    level: "4.0",
    title: "Просунутий аматор",
    points: [
      "Показує високу стабільність.",
      "Має сильну подачу.",
      "Впевнено використовує тактику.",
      "Витримує довгі матчі на високому рівні.",
    ],
  },
  {
    level: "4.25",
    title: "Дуже сильний аматор",
    points: [
      "Має власний стиль гри.",
      "Практично не має слабких сторін.",
      "Показує високу якість ударів.",
      "Регулярно перемагає сильних суперників.",
    ],
  },
  {
    level: "4.5",
    title: "Напівпрофесійний рівень",
    points: [
      "Володіє всіма технічними елементами.",
      "Підтримує високий темп гри.",
      "Має відмінну фізичну підготовку.",
      "Має великий досвід матчів.",
    ],
  },
  {
    level: "4.75",
    title: "Елітний аматор",
    points: [
      "Максимально наближений до професійного тенісу.",
      "Практично не має слабких місць.",
      "Має високий рівень тактичного мислення.",
      "Програє лише дуже сильним суперникам.",
    ],
  },
];

const ratingFactors = [
  "Результати матчів",
  "Стабільність гри",
  "Технічний рівень",
  "Тактичне мислення",
  "Рівень суперників",
  "Фізична підготовка",
];

export default function RatingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-[#123f2d] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/50">
            IRPIN TENNIS
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Рейтингова система
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Система допомагає знаходити суперників приблизно однакового рівня
            гри. Під час оцінювання враховуються не лише результати матчів, а й
            стабільність, технічні навички та загальний рівень тенісу.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
              Рівні гри
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase text-[#123f2d]">
              Визначте свій рівень
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ratingLevels.map((rating) => (
              <RatingCard
                key={rating.level}
                level={rating.level}
                title={rating.title}
                points={rating.points}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
              Оцінювання
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase text-[#123f2d]">
              Як визначається рейтинг
            </h2>

            <p className="mt-4 leading-7 text-[#123f2d]/65">
              Рейтинг формується не за одним матчем. Враховується загальна
              якість гри та стабільність протягом тривалого періоду.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ratingFactors.map((factor) => (
                <div
                  key={factor}
                  className="flex items-center gap-3 rounded-2xl bg-[#f6f0e5] px-4 py-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#123f2d] text-sm font-black text-white">
                    ✓
                  </span>

                  <span className="font-bold text-[#123f2d]">
                    {factor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-[#123f2d] p-6 text-white shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#c6f13d]">
              Поточна форма
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase">
              Вплив ігрового дня
            </h2>

            <p className="mt-4 leading-7 text-white/70">
              Навіть гравці одного рейтингу можуть показувати різний рівень
              залежно від самопочуття, концентрації та поточної форми.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#c6f13d]">
                  Хороший день
                </p>

                <p className="mt-3 text-4xl font-black">
                  +0.25
                </p>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  Гравець може показати рівень трохи вищий за свій звичний.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-orange-300">
                  Невдалий день
                </p>

                <p className="mt-3 text-4xl font-black">
                  −0.25
                </p>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  Поточна гра може бути трохи нижчою за звичний рейтинг.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-bold leading-7 text-white/80">
                Одна перемога або одна поразка не означає автоматичну зміну
                рейтингу. Оцінюється загальна картина гри.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ad4529]">
                Головна мета
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase text-[#123f2d]">
                Рівні та конкурентні матчі
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-[#123f2d]/65">
                Рейтингова система створена для того, щоб матчі були
                максимально цікавими, рівними та корисними для прогресу
                кожного учасника.
              </p>
            </div>

            <Link
              href="/players"
              className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-4 font-black text-white transition hover:bg-[#0d3123]"
            >
              Переглянути гравців →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function RatingCard({
  level,
  title,
  points,
}: {
  level: string;
  title: string;
  points: string[];
}) {
  return (
    <article className="overflow-hidden rounded-[26px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="bg-[#123f2d] px-5 py-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
          Рівень
        </p>

        <p className="mt-1 text-4xl font-black text-[#c6f13d]">
          {level}
        </p>

        <h3 className="mt-2 text-lg font-black">
          {title}
        </h3>
      </div>

      <ul className="space-y-3 p-5">
        {points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-sm leading-6 text-[#123f2d]/70"
          >
            <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#ad4529]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}