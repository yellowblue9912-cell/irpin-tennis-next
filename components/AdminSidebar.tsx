import Link from "next/link";

const navigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "⌂",
  },
  {
    href: "/admin/players",
    label: "Гравці",
    icon: "👥",
  },
  {
    href: "/admin/tournaments",
    label: "Турніри",
    icon: "🏆",
  },
  {
    href: "/admin/matches",
    label: "Матчі",
    icon: "🎾",
  },
  {
    href: "/admin/rating",
    label: "Рейтинг",
    icon: "📈",
  },
  {
    href: "/admin/gallery",
    label: "Галерея",
    icon: "🖼",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="border-b border-white/10 bg-[#123f2d] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-5 py-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7f34c] text-xl font-black text-[#123f2d]">
            IT
          </div>

          <div>
            <p className="text-lg font-black uppercase">
              Irpin Tennis
            </p>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
              Admin
            </p>
          </div>
        </Link>

        <nav className="mt-8 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden pt-10 lg:block">
          <form action="/api/admin/logout" method="post" className="mb-3">
            <button className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white">
              Вийти з адмін-панелі
            </button>
          </form>
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ← Перейти на сайт
          </Link>
        </div>
      </div>
    </aside>
  );
}
