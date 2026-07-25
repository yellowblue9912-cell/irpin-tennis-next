import Link from "next/link";

const courts = [
  {
    name: "Корт Виговського",
    slug: "vyhovskoho",
    address: "вул. Виговського, 9",
    city: "Ірпінь",
    surface: "Ґрунт",
    type: "Відкритий корт",
    courtsCount: "1 корт",
    image: "/vyhovskoho-court.jpg",
  },
  {
    name: "Terrakort",
    slug: "terrakort",
    address: "Синергія 3, посеред поля",
    city: "Ірпінь",
    surface: "Ґрунт",
    type: "Критий та відкритий",
    courtsCount: "2 корти",
    image: "/terrakort.jpg",
  },
  {
    name: "Кампа",
    slug: "campa-bucha",
    address: "Лісова вулиця, 1",
    city: "Буча",
    surface: "Ґрунт",
    type: "Криті та відкриті",
    courtsCount: "Тенісний комплекс",
    image: "/campa-bucha.jpg",
  },
  {
    name: "Лювс",
    slug: "luvs",
    address: "10-та лінія, Ірпінь",
    city: "Ірпінь",
    surface: "Ґрунт",
    type: "Відкритий",
    courtsCount: "1 корт",
    image: "/luvs-court.jpg",
  },
  {
    name: "Пуща-Водиця",
    slug: "pushcha-vodytsia",
    address: "вул. Квітки Цісик, 54",
    city: "Київ",
    surface: "Ґрунт",
    type: "Відкриті корти",
    courtsCount: "3 корти",
    image: "/pushcha-vodytsia-court.jpg",
  },
  {
    name: "ДЮСШ Ірпінь",
    slug: "diussh-irpin",
    address: "вул. Троїцька, 40",
    city: "Ірпінь",
    surface: "Уточнюйте",
    type: "Відкритий корт",
    courtsCount: "Тенісний корт",
    image: "/diussh-irpin-court.jpg",
  },
];

export default function CourtsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-[#123f2d] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/50">
            IRPIN TENNIS
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Тенісні корти
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Обирайте корт, переглядайте адресу, вартість та контакти для
            бронювання.
          </p>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courts.map((court) => (
            <Link
              key={court.slug}
              href={`/courts/${court.slug}`}
              className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <img
                  src={court.image}
                  alt={court.name}
                  className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105 ${
                    court.slug === "terrakort"
                      ? "object-contain"
                      : "object-cover"
                  }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#123f2d] backdrop-blur">
                    {court.courtsCount}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">
                    {court.city}
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {court.name}
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <p className="font-bold text-[#123f2d]">
                  📍 {court.address}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-black text-[#123f2d]">
                    {court.surface}
                  </span>

                  <span className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-black text-[#123f2d]">
                    {court.type}
                  </span>
                </div>

                <p className="mt-5 font-black text-[#ad4529] transition group-hover:translate-x-1">
                  Детальніше →
                </p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
