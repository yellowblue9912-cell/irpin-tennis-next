import Link from "next/link";

export default function AdminMatchesPage() {
  return (
    <main>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Результати
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Додати матч
        </h1>
        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          Оберіть тип змагання. Після збереження матч з’явиться на сайті,
          у профілях гравців і буде врахований у рейтингу.
        </p>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href="/admin/matches/league/new"
          className="group rounded-[28px] bg-[#123f2d] p-7 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-2xl font-black uppercase">
            Матч ліги
          </h2>
          <p className="mt-3 leading-7 text-white/65">
            Оберіть сезон і двох учасників, внесіть дату та рахунок.
            Турнірна таблиця і рейтинг оновляться автоматично.
          </p>
          <span className="mt-7 block font-black text-[#d7f34c]">
            Внести результат →
          </span>
        </Link>

        <Link
          href="/admin/tournaments/new"
          className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="text-4xl">🏆</span>
          <h2 className="mt-6 text-2xl font-black uppercase text-[#123f2d]">
            Новий турнір
          </h2>
          <p className="mt-3 leading-7 text-[#123f2d]/55">
            Створіть турнір, додайте учасників і перейдіть до внесення
            його результатів.
          </p>
          <span className="mt-7 block font-black text-[#ad4529]">
            Створити турнір →
          </span>
        </Link>
      </section>
    </main>
  );
}
