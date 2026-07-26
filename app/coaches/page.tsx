import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тренери з тенісу в Ірпені та Бучі | Irpin Tennis",
  description:
    "Тренери з тенісу для дітей, початківців і досвідчених гравців: ціни, формати занять, корти, телефони та Telegram.",
  alternates: { canonical: "/coaches" },
};

type Coach = {
  name: string;
  image: string;
  phone?: string;
  telegram?: string;
  audience: string;
  formats: string[];
  prices: string[];
  courts: string;
  imagePosition?: string;
};

const coaches: Coach[] = [
  {
    name: "Анна",
    image: "/coaches/anna.jpg",
    audience: "Поки учнів не набирає.",
    formats: [],
    prices: [],
    courts: "Набір призупинено",
  },
  {
    name: "Юрій Ярославович",
    image: "/coaches/yurii.png",
    phone: "+380 96 756 10 94",
    audience: "Діти та гравці-початківці.",
    formats: ["Персональні тренування", "Групові тренування"],
    prices: ["800 грн / година"],
    courts: "Лювс, Теракорт",
  },
  {
    name: "Ніка",
    image: "/coaches/nika.jpg",
    phone: "+380 98 078 70 82",
    telegram: "ccnlil",
    audience: "Діти, початківці та любителі середнього рівня.",
    formats: [
      "Персональні тренування",
      "Спліт-тренування",
      "Групи 3–4 людини",
      "Спаринг-партнерка",
    ],
    prices: [
      "Індивідуальне — 700 грн",
      "Спліт — 1000 грн",
      "Група — 1200 грн",
    ],
    courts: "Теракорт, Лювс",
    imagePosition: "object-[center_62%]",
  },
  {
    name: "Мирослав",
    image: "/coaches/myroslav.jpg",
    phone: "+380 93 303 78 68",
    telegram: "Miroslav_Lozko",
    audience: "27 років. Тренує дітей, початківців і любителів середнього рівня.",
    formats: ["Персональні тренування", "Групові тренування"],
    prices: [
      "Персональне — 900 грн",
      "Абонемент: 12 групових занять — 5000 грн",
    ],
    courts: "Усі корти",
  },
  {
    name: "Діма Санченко",
    image: "/coaches/dima.jpg",
    phone: "+380 96 733 02 77",
    telegram: "SanchenkoD",
    audience:
      "Гравці з досвідом від двох років, діти від 10 років і просунуті любителі, які впевнено тримають м’яч у корті.",
    formats: ["Персональні тренування"],
    prices: ["Від 800 грн"],
    courts: "Теракорт",
  },
  {
    name: "Марія",
    image: "/coaches/maria.jpg",
    phone: "+380 93 462 86 80",
    telegram: "izmaylova_m_",
    audience: "Персональні, спліт- і групові тренування.",
    formats: ["Персональні тренування", "Спліт-тренування", "Групові тренування"],
    prices: [
      "Індивідуальне — 1000 грн",
      "Спліт — 1200 грн",
      "Групове — від 500 грн",
    ],
    courts: "Теракорт, Лювс",
    imagePosition: "object-[center_35%]",
  },
  {
    name: "Максим",
    image: "/coaches/maksym.jpg",
    phone: "+380 67 500 57 08",
    telegram: "Yakhnii",
    audience: "Тренує дітей і дорослих будь-якого рівня.",
    formats: ["Тренування для дітей", "Тренування для дорослих"],
    prices: ["Вартість — за домовленістю"],
    courts: "Campa",
  },
];

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function CoachesPage() {
  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <section className="bg-[#123f2d] px-4 py-9 text-white sm:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d7f34c]">
            Irpin Tennis
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase sm:text-5xl">
            Наші тренери
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Оберіть тренера, формат занять і зручний корт. Зв’язатися можна
            телефоном або через Telegram.
          </p>
          <p className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80">
            Оренда корту для всіх тренувань оплачується окремо
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-3 py-6 sm:grid-cols-2 sm:gap-5 sm:px-5 sm:py-10">
        {coaches.map((coach) => (
          <article
            key={coach.name}
            className="overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-[28px]"
          >
            <div className="grid grid-cols-[112px_minmax(0,1fr)] sm:block">
              <div className="relative min-h-[168px] sm:aspect-[16/9]">
                <Image
                  src={coach.image}
                  alt={`Тренер ${coach.name}`}
                  fill
                  sizes="(max-width: 640px) 112px, 50vw"
                  className={`object-cover ${coach.imagePosition ?? "object-center"}`}
                />
              </div>

              <div className="p-3 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ad4529]">
                      Тренер
                    </p>
                    <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
                      {coach.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#f6f0e5] px-2.5 py-1 text-[10px] font-black">
                    {coach.courts}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#123f2d]/65 sm:text-sm">
                  {coach.audience}
                </p>

                <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                  {coach.formats.map((format) => (
                    <span
                      key={format}
                      className="rounded-full bg-[#edf3ee] px-3 py-1 text-xs font-bold"
                    >
                      {format}
                    </span>
                  ))}
                </div>

                <div className="mt-3 space-y-1 border-t border-[#123f2d]/10 pt-3">
                  {coach.prices.map((price) => (
                    <p key={price} className="text-xs font-black sm:text-sm">
                      {price}
                    </p>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {coach.phone && (
                    <a
                      href={phoneHref(coach.phone)}
                      className="rounded-full bg-[#d7f34c] px-3 py-2 text-[11px] font-black text-[#123f2d] sm:px-4 sm:text-xs"
                    >
                      Зателефонувати
                    </a>
                  )}
                  {coach.telegram && (
                    <a
                      href={`https://t.me/${coach.telegram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#229ed9] px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs"
                    >
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
