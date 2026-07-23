import Link from "next/link";

const statistics = [
  {
    label: "Гравців",
    value: "0",
    icon: "👥",
  },
  {
    label: "Турнірів",
    value: "0",
    icon: "🏆",
  },
  {
    label: "Матчів",
    value: "0",
    icon: "🎾",
  },
  {
    label: "Фото",
    value: "0",
    icon: "🖼",
  },
];

const actions = [
  {
    href: "/admin/players",
    title: "Додати гравця",
    description: "Створити профіль нового учасника ліги.",
    icon: "＋",
  },
  {
    href: "/admin/tournaments",
    title: "Створити турнір",
    description: "Додати турнір, дату, рівень і призерів.",
    icon: "🏆",
  },
  {
    href: "/admin/matches",
    title: "Внести результат",
    description: "Додати зіграний матч і рахунок.",
    icon: "🎾",
  },
];

export default function AdminPage() {
  return (
    <main>
      <section className="rounded-[32px] bg-[#123f2d] p-7 text-white shadow-sm md:p-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d7f34c]">
              Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Вітаємо в адмінці
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-white/60">
              Тут можна керувати гравцями, турнірами, матчами,
              результатами та рейтингом IRPIN TENNIS.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-full bg-[#d7f34c] px-6 py-3 font-black text-[#123f2d] transition hover:-translate-y-0.5"
          >
            Переглянути сайт →
          </Link>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <article
            key={item.label}
            className="rounded-[26px] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#123f2d]/45">
                  {item.label}
                </p>

                <strong className="mt-3 block text-4xl font-black">
                  {item.value}
                </strong>
              </div>

              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6f0e5] text-xl">
                {item.icon}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
              Швидкі дії
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase">
              Що додаємо?
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d7f34c] text-2xl font-black">
                {action.icon}
              </span>

              <h3 className="mt-6 text-xl font-black uppercase">
                {action.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#123f2d]/55">
                {action.description}
              </p>

              <span className="mt-6 block font-black text-[#ad4529] transition group-hover:translate-x-1">
                Відкрити →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] bg-white p-7 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
              Остання активність
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase">
              Даних ще немає
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-[#123f2d]/50">
            Після додавання першого гравця або турніру тут
            з’являться останні зміни.
          </p>
        </div>
      </section>
    </main>
  );
}