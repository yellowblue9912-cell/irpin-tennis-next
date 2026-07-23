import Link from "next/link";

export default function ImportTournamentPage() {
  return (
    <main>
      <Link
        href="/admin/tournaments"
        className="text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
      >
        ← Повернутися до турнірів
      </Link>

      <div className="mt-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Historical Import
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Імпорт минулого турніру
        </h1>

        <p className="mt-3 max-w-3xl text-[#123f2d]/55">
          Завантаж фотографію турнірної таблиці та внеси основні дані.
          Перед записом у базу результати можна буде перевірити.
        </p>
      </div>

      <form className="mt-8 max-w-4xl rounded-[28px] bg-white p-7 shadow-sm md:p-9">
        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Фото турнірної таблиці
          </label>

          <label
            htmlFor="image"
            className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#123f2d]/20 bg-[#f6f0e5] p-8 text-center transition hover:border-[#123f2d]/45"
          >
            <span className="text-4xl">📷</span>

            <span className="mt-4 font-black text-[#123f2d]">
              Натисни, щоб вибрати фотографію
            </span>

            <span className="mt-2 text-sm text-[#123f2d]/45">
              JPG, PNG або WEBP
            </span>
          </label>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Назва турніру
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="IRPIN TENNIS 3.0–3.5"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>

          <div>
            <label
              htmlFor="tournament_date"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Дата турніру
            </label>

            <input
              id="tournament_date"
              name="tournament_date"
              type="date"
              required
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Локація
            </label>

            <input
              id="location"
              name="location"
              type="text"
              placeholder="Теракорт"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>

          <div>
            <label
              htmlFor="format"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Формат турніру
            </label>

            <select
              id="format"
              name="format"
              defaultValue="groups_playoff"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            >
              <option value="round_robin">Кожен із кожним</option>
              <option value="partial_round_robin">
                Обмежена кількість матчів
              </option>
              <option value="groups_playoff">Групи + плей-оф</option>
              <option value="single_elimination">Плей-оф</option>
              <option value="custom">Інший формат</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Примітки
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Наприклад: 8 гравців, 2 групи, один короткий сет до 6 геймів..."
            className="w-full resize-none rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-8 rounded-2xl bg-[#fff5df] p-5">
          <p className="font-black text-[#123f2d]">
            Наступний етап
          </p>

          <p className="mt-2 text-sm leading-6 text-[#123f2d]/60">
            Після завантаження зображення тут з’явиться екран перевірки:
            учасники, матчі, рахунки та підсумкові місця.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Продовжити до перевірки
          </button>

          <Link
            href="/admin/tournaments"
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 px-6 py-3 font-black text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </main>
  );
}