import type { Metadata } from "next";
import CourtsCatalog, {
  type CourtCatalogItem,
} from "@/components/CourtsCatalog";

export const metadata: Metadata = {
  title: "Тенісні корти Ірпеня, Бучі та передмістя | Irpin Tennis",
  description:
    "Порівнюйте тенісні корти за ціною, покриттям, типом та зручностями. Адреси, фото, ціни й контакти для бронювання.",
};

const courts: CourtCatalogItem[] = [
  {
    name: "Корт Виговського",
    slug: "vyhovskoho",
    address: "вул. Виговського, 9",
    city: "Ірпінь",
    surface: "Ґрунт",
    type: "Відкритий корт",
    courtsCount: "1 корт",
    image: "/vyhovskoho-court.jpg",
    price: 450,
    indoor: false,
    outdoor: true,
    shower: false,
    toilet: true,
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
    price: 500,
    indoor: true,
    outdoor: true,
    shower: true,
    toilet: true,
    onlineBooking: true,
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
    price: 650,
    indoor: true,
    outdoor: true,
    shower: true,
    toilet: true,
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
    price: 500,
    indoor: false,
    outdoor: true,
    shower: true,
    toilet: true,
    stringer: true,
    onlineBooking: true,
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
    price: 500,
    indoor: false,
    outdoor: true,
    shower: true,
    toilet: true,
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
    price: 400,
    indoor: false,
    outdoor: true,
    shower: false,
    toilet: false,
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

        <CourtsCatalog courts={courts} />

        <section
          aria-labelledby="tennis-services-title"
          className="mt-8 overflow-hidden rounded-[28px] border border-[#123f2d]/10 bg-white shadow-sm"
        >
          <div className="grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">
                Послуги для тенісистів
              </p>
              <h2
                id="tennis-services-title"
                className="mt-2 text-2xl font-black uppercase text-[#123f2d] sm:text-3xl"
              >
                Стрінгування ракеток
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#123f2d]/65 sm:text-base">
                Стас — заміна струн на тенісних ракетках.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f6f0e5] px-3 py-1.5 text-xs font-black text-[#123f2d]">
                  📍 Корт «Лювс»
                </span>
                <span className="rounded-full bg-[#f6f0e5] px-3 py-1.5 text-xs font-black text-[#123f2d]">
                  700 грн — якщо у вас немає струн
                </span>
                <span className="rounded-full bg-[#f6f0e5] px-3 py-1.5 text-xs font-black text-[#123f2d]">
                  400 грн — зі своїми струнами
                </span>
              </div>
            </div>

            <div className="border-t border-[#123f2d]/10 p-5 md:border-l md:border-t-0 md:p-7">
              <a
                href="tel:+380916134919"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#d7f34c] px-6 py-3.5 text-sm font-black uppercase tracking-wide text-[#123f2d] transition hover:-translate-y-0.5 hover:bg-[#c9eb2e] md:w-auto"
              >
                Зателефонувати
              </a>
              <p className="mt-3 text-center text-sm font-bold text-[#123f2d]/60">
                091 613 49 19
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
