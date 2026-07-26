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
      </div>
    </main>
  );
}
