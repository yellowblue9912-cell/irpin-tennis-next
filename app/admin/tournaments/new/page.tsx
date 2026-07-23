import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../lib/supabase/server";

export default function NewTournamentPage() {
  async function createTournament(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const tournamentDate = String(
      formData.get("tournament_date") ?? ""
    ).trim();
    const location = String(formData.get("location") ?? "").trim();
    const minRatingValue = String(formData.get("min_rating") ?? "").trim();
    const maxRatingValue = String(formData.get("max_rating") ?? "").trim();
    const format = String(formData.get("format") ?? "").trim();
    const status = String(formData.get("status") ?? "draft").trim();
    const description = String(formData.get("description") ?? "").trim();

    const minRating =
      minRatingValue === "" ? null : Number(minRatingValue);

    const maxRating =
      maxRatingValue === "" ? null : Number(maxRatingValue);

    if (!title) {
      throw new Error("Вкажіть назву турніру");
    }

    if (!slug) {
      throw new Error("Вкажіть slug турніру");
    }

    if (!tournamentDate) {
      throw new Error("Вкажіть дату турніру");
    }

    if (minRating !== null && !Number.isFinite(minRating)) {
      throw new Error("Некоректний мінімальний рейтинг");
    }

    if (maxRating !== null && !Number.isFinite(maxRating)) {
      throw new Error("Некоректний максимальний рейтинг");
    }

    if (
      minRating !== null &&
      maxRating !== null &&
      minRating > maxRating
    ) {
      throw new Error(
        "Мінімальний рейтинг не може бути більшим за максимальний"
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("tournaments").insert({
      title,
      slug,
      tournament_date: tournamentDate,
      location: location || null,
      min_rating: minRating,
      max_rating: maxRating,
      format: format || null,
      status,
      description: description || null,
    });

    if (error) {
      console.error("Create tournament error:", error);
      throw new Error(`Не вдалося створити турнір: ${error.message}`);
    }

    revalidatePath("/admin/tournaments");
    redirect("/admin/tournaments");
  }

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
          Tournaments
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase text-[#123f2d]">
          Створити турнір
        </h1>

        <p className="mt-3 text-[#123f2d]/55">
          Додай основну інформацію про новий турнір IRPIN TENNIS.
        </p>
      </div>

      <form
        action={createTournament}
        className="mt-8 max-w-3xl rounded-[28px] bg-white p-7 shadow-sm md:p-9"
      >
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
            placeholder="Наприклад: Літній Кубок 2026"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="litniy-kubok-2026"
            className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />

          <p className="mt-2 text-sm text-[#123f2d]/45">
            Латинські літери, цифри та дефіси без пробілів.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="tournament_date"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Дата
            </label>

            <input
              id="tournament_date"
              name="tournament_date"
              type="date"
              required
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>

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
              placeholder="Наприклад: Ірпінь"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="min_rating"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Мінімальний рейтинг
            </label>

            <input
              id="min_rating"
              name="min_rating"
              type="number"
              min="1"
              max="7"
              step="0.25"
              placeholder="3.00"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>

          <div>
            <label
              htmlFor="max_rating"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Максимальний рейтинг
            </label>

            <input
              id="max_rating"
              name="max_rating"
              type="number"
              min="1"
              max="7"
              step="0.25"
              placeholder="3.50"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="format"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Формат
            </label>

            <select
              id="format"
              name="format"
              defaultValue="round_robin"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            >
              <option value="round_robin">Кругова система</option>
              <option value="single_elimination">Олімпійська система</option>
              <option value="groups_playoff">Групи + плей-оф</option>
              <option value="custom">Інший формат</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-black uppercase tracking-wide"
            >
              Статус
            </label>

            <select
              id="status"
              name="status"
              defaultValue="draft"
              className="w-full rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
            >
              <option value="draft">Чернетка</option>
              <option value="registration">Реєстрація</option>
              <option value="active">Триває</option>
              <option value="finished">Завершений</option>
              <option value="cancelled">Скасований</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-black uppercase tracking-wide"
          >
            Опис
          </label>

          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Додаткова інформація про турнір..."
            className="w-full resize-none rounded-2xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none transition focus:border-[#123f2d]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-[#123f2d] px-6 py-3 font-black text-white transition hover:bg-[#1b5a41]"
          >
            Створити турнір
          </button>

          <Link
            href="/admin/tournaments"
            className="inline-flex items-center justify-center rounded-2xl border border-[#123f2d]/15 px-6 py-3 font-black transition hover:bg-[#f6f0e5]"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </main>
  );
}