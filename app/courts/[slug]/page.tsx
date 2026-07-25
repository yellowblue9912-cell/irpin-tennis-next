import Link from "next/link";
import { notFound } from "next/navigation";

type CourtPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Court = {
  name: string;
  address: string;
  city: string;
  surface: string;
  image: string;
  description: string;
  schedule: string | null;
  courts: string[];
  prices: {
    title: string;
    price: string;
  }[];
  phones: {
    label: string;
    href: string;
  }[];
  bookingUrl: string | null;
  mapUrl: string;
};

const courts: Record<string, Court> = {
  vyhovskoho: {
    name: "Корт Виговського",
    address: "вул. Виговського, 9",
    city: "Ірпінь",
    surface: "Ґрунт",
    image: "/vyhovskoho-court.jpg",
    description:
      "Відкритий ґрунтовий тенісний корт в Ірпені. Доступне вечірнє освітлення.",
    schedule: null,
    courts: ["1 відкритий корт"],
    prices: [
      {
        title: "Оренда корту",
        price: "450 грн / година",
      },
      {
        title: "Освітлення",
        price: "+100 грн",
      },
    ],
    phones: [
      {
        label: "097 663 18 34",
        href: "tel:+380976631834",
      },
      {
        label: "093 303 78 68",
        href: "tel:+380933037868",
      },
    ],
    bookingUrl: "https://irpin-tenis.com/",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Ірпінь+вулиця+Виговського+9",
  },

  terrakort: {
    name: "Terrakort",
    address: "Синергія 3, посеред поля",
    city: "Ірпінь",
    surface: "Ґрунт",
    image: "/terrakort.jpg",
    description:
      "Тенісний комплекс Terrakort із критим та відкритим ґрунтовими кортами.",
    schedule: null,
    courts: ["1 критий корт", "1 відкритий корт"],
    prices: [
      {
        title: "Критий корт",
        price: "600 грн / година",
      },
      {
        title: "Відкритий корт",
        price: "500 грн / година",
      },
    ],
    phones: [
      {
        label: "096 756 10 94",
        href: "tel:+380967561094",
      },
    ],
    bookingUrl: null,
    mapUrl:
      "https://maps.app.goo.gl/ZrAggQXzN3eMCyGq7?g_st=ic",
  },

  "campa-bucha": {
    name: "Кампа",
    address: "Лісова вулиця, 1",
    city: "Буча",
    surface: "Ґрунт",
    image: "/campa-bucha.jpg",
    description:
      "Тенісний комплекс у Бучі з відкритими та критими ґрунтовими кортами.",
    schedule: "Щодня, 07:00–21:00",
    courts: ["Відкриті корти", "Криті корти"],
    prices: [
      {
        title: "Відкритий корт",
        price: "650 грн / година",
      },
      {
        title: "Критий корт",
        price: "850 грн / година",
      },
    ],
    phones: [
      {
        label: "+380 (96) 944 32 72",
        href: "tel:+380969443272",
      },
    ],
    bookingUrl: null,
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Лісова+вулиця+1+Буча",
  },

  luvs: {
    name: "Лювс",
    address: "10-та лінія",
    city: "Ірпінь",
    surface: "Ґрунт",
    image: "/luvs-court.jpg",
    description:
      "Відкритий ґрунтовий тенісний корт в Ірпені. Доступне вечірнє освітлення.",
    schedule: null,
    courts: ["1 відкритий корт"],
    prices: [
      {
        title: "Оренда корту",
        price: "500 грн / година",
      },
      {
        title: "Освітлення",
        price: "+100 грн",
      },
    ],
    phones: [
      {
        label: "096 756 10 94",
        href: "tel:+380967561094",
      },
    ],
    bookingUrl: null,
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=10-та+лінія+Ірпінь",
  },
};

export default async function CourtPage({
  params,
}: CourtPageProps) {
  const { slug } = await params;
  const court = courts[slug];

  if (!court) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/courts"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#123f2d]/60 transition hover:text-[#123f2d]"
        >
          ← Усі корти
        </Link>

        <section className="mt-6 overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="relative min-h-[360px] overflow-hidden sm:min-h-[520px]">
            <img
              src={court.image}
              alt={court.name}
              className={`absolute inset-0 h-full w-full ${
                slug === "terrakort" ? "object-contain" : "object-cover"
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">
                Тенісний корт
              </p>

              <h1 className="mt-2 text-4xl font-black uppercase sm:text-6xl">
                {court.name}
              </h1>

              <p className="mt-3 text-base font-bold text-white/85">
                📍 {court.address}, {court.city}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black uppercase text-[#123f2d]">
              Інформація про корт
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[#123f2d]/65">
              {court.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Адреса"
                value={court.address}
                icon="📍"
              />

              <InfoCard
                label="Покриття"
                value={court.surface}
                icon="🎾"
              />

              {court.schedule && (
                <InfoCard
                  label="Графік роботи"
                  value={court.schedule}
                  icon="🕘"
                />
              )}

              {court.courts.map((courtType) => (
                <InfoCard
                  key={courtType}
                  label="Тип корту"
                  value={courtType}
                  icon={
                    courtType.toLowerCase().includes("крит")
                      ? "🏠"
                      : "☀️"
                  }
                />
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black uppercase text-[#123f2d]">
                Вартість
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {court.prices.map((price) => (
                  <div
                    key={price.title}
                    className="rounded-2xl bg-[#f6f0e5] p-5"
                  >
                    <p className="text-sm font-bold text-[#123f2d]/50">
                      {price.title}
                    </p>

                    <p className="mt-2 text-xl font-black text-[#123f2d]">
                      {price.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] bg-[#123f2d] p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-2xl font-black uppercase">
              Бронювання
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/65">
              Зателефонуйте для уточнення вільного часу та бронювання корту.
            </p>

            <div className="mt-6 space-y-3">
              {court.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-black transition hover:bg-white/10"
                >
                  <span>📞 {phone.label}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>

            {court.bookingUrl && (
              <a
                href={court.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center rounded-2xl bg-[#c6f13d] px-5 py-4 font-black text-[#123f2d] transition hover:brightness-95"
              >
                Забронювати онлайн
              </a>
            )}

            <a
              href={court.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center rounded-2xl border border-white/20 px-5 py-4 font-black text-white transition hover:bg-white/10"
            >
              Прокласти маршрут
            </a>
          </aside>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f6f0e5] p-5">
      <p className="text-2xl">{icon}</p>

      <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#123f2d]/45">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-[#123f2d]">
        {value}
      </p>
    </div>
  );
}
