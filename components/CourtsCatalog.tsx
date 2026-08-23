import Link from "next/link";

export type CourtCatalogItem = {
  name: string;
  slug: string;
  address: string;
  city: string;
  surface: string;
  type: string;
  courtsCount: string;
  image: string;
  price: number;
  indoor: boolean;
  outdoor: boolean;
  shower: boolean;
  toilet: boolean;
  stringer?: boolean;
  onlineBooking?: boolean;
};

type CourtsCatalogProps = {
  courts: CourtCatalogItem[];
};

export default function CourtsCatalog({ courts }: CourtsCatalogProps) {
  return (
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
              alt={`${court.name} — тенісний корт`}
              className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105 ${
                court.slug === "terrakort" ? "object-contain" : "object-cover"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#123f2d] backdrop-blur">
                від {court.price} грн/год
              </span>
              {court.onlineBooking ? (
                <span className="rounded-full bg-[#c6f13d] px-3 py-1 text-xs font-black text-[#123f2d] shadow-sm">
                  Онлайн-бронювання
                </span>
              ) : null}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">
                {court.city} · {court.courtsCount}
              </p>
              <h2 className="mt-1 text-2xl font-black">{court.name}</h2>
            </div>
          </div>

          <div className="p-5">
            <p className="font-bold text-[#123f2d]">📍 {court.address}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[court.surface, court.type]
                .concat(court.shower ? ["Душ"] : [])
                .concat(court.toilet ? ["Туалет"] : [])
                .concat(court.stringer ? ["Стрінгер на локації"] : [])
                .map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-[#f6f0e5] px-3 py-1 text-xs font-black text-[#123f2d]"
                  >
                    {label}
                  </span>
                ))}
            </div>
            <p className="mt-5 font-black text-[#ad4529] transition group-hover:translate-x-1">
              {court.onlineBooking
                ? "Детальніше та бронювання →"
                : "Детальніше →"}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
