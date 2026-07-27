import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Як працює рейтинг | Irpin Tennis",
  description:
    "Правила та формула рейтингу Irpin Tennis, вплив результатів матчів і опис тенісних рівнів від 3.0 до 4.75.",
  alternates: { canonical: "/rating" },
};

const ratingLevels = [
  {
    level: "3.0",
    title: "Початковий рівень",
    skills: [
      "Підтримує 6–8 спокійних ударів із задньої лінії.",
      "Перша подача потрапляє приблизно у половині спроб.",
      "Друга подача дозволяє почати розіграш, але ще нестабільна.",
      "Знає правила, рахунок і може самостійно провести матч.",
    ],
    opponents: "Грає рівні матчі з 3.0, поступається більшості гравців 3.25.",
    nextStep: "Стабілізувати другу подачу та навчитися контролювати напрямок удару.",
  },
  {
    level: "3.25",
    title: "Любитель, що прогресує",
    skills: [
      "Тримає 8–10 ударів у середньому темпі.",
      "Має один достатньо стабільний основний удар.",
      "Друга подача переважно потрапляє в корт.",
      "Починає контролювати напрямок і атакувати короткий м’яч.",
    ],
    opponents: "Регулярно перемагає 3.0; проти 3.5 грає конкурентно, але частіше програє.",
    nextStep: "Покращити бекхенд, глибину ударів і стабільність під тиском.",
  },
  {
    level: "3.5",
    title: "Впевнений аматор",
    skills: [
      "Тримає 10–15 ударів у середньому темпі.",
      "Стабільно грає форхендом і бекхендом.",
      "Може спрямувати м’яч кросом або по лінії.",
      "Має першу й обережну, але надійну другу подачу.",
      "Атакує нескладні короткі м’ячі.",
    ],
    opponents: "Регулярно перемагає 3.0–3.25; проти 3.75 грає конкурентно.",
    nextStep: "Навчитися контролювати глибину та рідше помилятися без тиску.",
  },
  {
    level: "3.75",
    title: "Сильний любитель",
    skills: [
      "Тримає стабільний темп і рідко помиляється без тиску.",
      "Контролює напрямок і частково глибину ударів.",
      "Має один виражено сильний ігровий елемент.",
      "Змінює напрямок під час розіграшу.",
      "Упевненіше завершує атаки з короткого м’яча.",
    ],
    opponents: "Регулярно перемагає 3.5; іноді перемагає 4.0, але ще нестабільно.",
    nextStep: "Додати глибину, надійний прийом і стабільність у високому темпі.",
  },
  {
    level: "4.0",
    title: "Просунутий аматор",
    skills: [
      "Стабільно грає в середньому та підвищеному темпі.",
      "Контролює напрямок, глибину і частково обертання.",
      "Змінює напрямок першої подачі та має надійну другу.",
      "Переходить із захисту в атаку й завершує короткі м’ячі.",
      "Будує гру навколо власних сильних сторін.",
    ],
    opponents: "Регулярно перемагає 3.5–3.75 та грає рівні матчі з 4.0.",
    nextStep: "Покращити гру під тиском, прийом сильної подачі й зміну тактики.",
  },
  {
    level: "4.25",
    title: "Дуже сильний аматор",
    skills: [
      "Витримує високий темп без різкого зростання помилок.",
      "Має одну або дві виражені ігрові переваги.",
      "Змінює темп, обертання, висоту та напрямок м’яча.",
      "Добре приймає сильну подачу.",
      "Карає суперника за більшість коротких м’ячів.",
    ],
    opponents: "Регулярно перемагає 4.0; проти 4.5 результат ще нестабільний.",
    nextStep: "Навчитися стабільно нав’язувати свій план гри сильним суперникам.",
  },
  {
    level: "4.5",
    title: "Дуже сильний аматор",
    skills: [
      "Упевнено грає у високому темпі та під тиском.",
      "Має сильну першу й надійну другу подачу з обертанням.",
      "Атакує як форхендом, так і бекхендом.",
      "Контролює глибину, напрямок, темп і обертання.",
      "Добре передбачає удари й завершує розіграші біля сітки.",
    ],
    opponents: "Практично не програє рівням до 4.0 та регулярно перемагає 4.25.",
    nextStep: "Прибрати очевидні слабкі місця та стабільно грати проти 4.75.",
  },
  {
    level: "4.75",
    title: "Елітний аматор",
    skills: [
      "Стабільно перевершує більшість гравців 4.5.",
      "Має декілька сильних елементів без очевидної слабкої сторони.",
      "Підтримує високий темп протягом усього матчу.",
      "Ефективно атакує слабку другу подачу.",
      "Швидко знаходить слабкі сторони суперника та змінює план.",
    ],
    opponents: "Конкурентно грає з рівнем 5.0 та досвідченими турнірними гравцями.",
    nextStep: "Підтверджувати рівень результатами проти найсильніших гравців спільноти.",
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
            Як працює рейтинг
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Система допомагає знаходити суперників приблизно однакового рівня
            гри. Під час оцінювання враховуються не лише результати матчів, а й
            стабільність, технічні навички та загальний рівень тенісу.
          </p>
          <p className="mt-4 max-w-3xl rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-white/80">
            Irpin Tennis використовує внутрішню шкалу з кроком 0.25, щоб
            точніше розділяти гравців між базовими рівнями. Для отримання рівня
            достатньо відповідати більшості критеріїв і підтверджувати його
            результатами матчів.
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
                skills={rating.skills}
                opponents={rating.opponents}
                nextStep={rating.nextStep}
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
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[#123f2d] bg-[#c6f13d] px-6 py-4 font-black text-[#123f2d] shadow-sm transition hover:bg-white"
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
  skills,
  opponents,
  nextStep,
}: {
  level: string;
  title: string;
  skills: string[];
  opponents: string;
  nextStep: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ad4529]">
          Що вже вміє
        </p>
        <ul className="mt-3 space-y-3">
        {skills.map((skill) => (
          <li
            key={skill}
            className="flex gap-3 text-sm leading-6 text-[#123f2d]/70"
          >
            <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#ad4529]" />
            <span>{skill}</span>
          </li>
        ))}
        </ul>

        <div className="mt-5 border-t border-[#123f2d]/10 pt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ad4529]">
            Типові суперники
          </p>
          <p className="mt-2 text-sm leading-6 text-[#123f2d]/70">
            {opponents}
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-[#f6f0e5] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#123f2d]/55">
            До наступного рівня
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#123f2d]">
            {nextStep}
          </p>
        </div>
      </div>
    </article>
  );
}
