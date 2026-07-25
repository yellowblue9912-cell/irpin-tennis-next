"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
};

type CourtsCatalogProps = {
  courts: CourtCatalogItem[];
};

export default function CourtsCatalog({ courts }: CourtsCatalogProps) {
  const highestPrice = Math.max(...courts.map((court) => court.price));
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [surface, setSurface] = useState("all");
  const [courtType, setCourtType] = useState("all");
  const [shower, setShower] = useState(false);
  const [toilet, setToilet] = useState(false);

  const surfaces = Array.from(
    new Set(courts.map((court) => court.surface)),
  );
  const filteredCourts = useMemo(
    () =>
      courts.filter((court) => {
        const matchesType =
          courtType === "all" ||
          (courtType === "indoor" && court.indoor) ||
          (courtType === "outdoor" && court.outdoor);

        return (
          court.price <= maxPrice &&
          (surface === "all" || court.surface === surface) &&
          matchesType &&
          (!shower || court.shower) &&
          (!toilet || court.toilet)
        );
      }),
    [courtType, courts, maxPrice, shower, surface, toilet],
  );

  function resetFilters() {
    setMaxPrice(highestPrice);
    setSurface("all");
    setCourtType("all");
    setShower(false);
    setToilet(false);
  }

  return (
    <>
      <section
        aria-label="Фільтри тенісних кортів"
        className="mt-8 rounded-[28px] bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#123f2d]">
              Підібрати корт
            </h2>
            <p className="mt-1 text-sm text-[#123f2d]/55">
              Знайдено: {filteredCourts.length}
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-[#123f2d]/15 px-4 py-2 text-sm font-bold text-[#123f2d] transition hover:bg-[#f6f0e5]"
          >
            Скинути
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-2xl bg-[#f6f0e5] p-4">
            <span className="text-xs font-black uppercase tracking-wide text-[#123f2d]/55">
              Ціна до {maxPrice} грн/год
            </span>
            <input
              type="range"
              min="400"
              max={highestPrice}
              step="50"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="mt-3 w-full accent-[#bb5a3c]"
            />
          </label>

          <label className="rounded-2xl bg-[#f6f0e5] p-4">
            <span className="text-xs font-black uppercase tracking-wide text-[#123f2d]/55">
              Покриття
            </span>
            <select
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
              className="mt-2 w-full bg-transparent font-bold text-[#123f2d] outline-none"
            >
              <option value="all">Усі покриття</option>
              {surfaces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-2xl bg-[#f6f0e5] p-4">
            <span className="text-xs font-black uppercase tracking-wide text-[#123f2d]/55">
              Тип корту
            </span>
            <select
              value={courtType}
              onChange={(event) => setCourtType(event.target.value)}
              className="mt-2 w-full bg-transparent font-bold text-[#123f2d] outline-none"
            >
              <option value="all">Усі корти</option>
              <option value="indoor">Криті</option>
              <option value="outdoor">Відкриті</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <FilterCheckbox
              label="Є душ"
              checked={shower}
              onChange={setShower}
            />
            <FilterCheckbox
              label="Є туалет"
              checked={toilet}
              onChange={setToilet}
            />
          </div>
        </div>
      </section>

      {filteredCourts.length > 0 ? (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourts.map((court) => (
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
                    court.slug === "terrakort"
                      ? "object-contain"
                      : "object-cover"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#123f2d] backdrop-blur">
                  від {court.price} грн/год
                </span>
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
                  Детальніше →
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-[28px] bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-black text-[#123f2d]">
            Кортів за цими параметрами не знайдено
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-full bg-[#123f2d] px-6 py-3 font-black text-white"
          >
            Скинути фільтри
          </button>
        </div>
      )}
    </>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-[#f6f0e5] p-4 font-bold text-[#123f2d]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#123f2d]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
