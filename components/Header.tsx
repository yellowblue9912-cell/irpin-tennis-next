"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { label: "Головна", href: "/" },
  { label: "Гравці", href: "/players" },
  { label: "Турніри", href: "/tournaments" },
  { label: "Ліга", href: "/league" },
  { label: "Корти", href: "/courts" },
  { label: "Тренери", href: "/coaches" },
  { label: "Рейтинг", href: "/rating" },
];

// Встав сюди справжнє посилання на Telegram
const telegramUrl = "https://t.me/+9RoKqlUk7VE3NTFi";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#efe3d3]/20 bg-[#bb5a3c] text-[#fff8ee] shadow-[0_8px_30px_rgba(18,63,45,0.18)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6 lg:h-[92px] lg:px-8">
        <Link
          href="/"
          aria-label="IRPIN TENNIS — головна сторінка"
          className="group flex shrink-0 items-center gap-4"
        >
          <Image
            src="/logo.png"
            alt="IRPIN TENNIS"
            width={140}
            height={140}
            priority
            className="h-[72px] w-[72px] shrink-0 object-contain drop-shadow-[0_7px_12px_rgba(18,63,45,0.25)] transition duration-300 group-hover:scale-105 sm:h-[96px] sm:w-[96px] lg:h-[124px] lg:w-[124px]"
          />

          <div className="hidden leading-none sm:block">
            <p className="text-[23px] font-black uppercase tracking-[0.13em] text-[#fff8ee]">
              IRPIN
            </p>

            <p className="mt-1 text-[23px] font-black uppercase tracking-[0.13em] text-[#fff8ee]">
              TENNIS
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group relative px-3 py-8 text-sm font-black uppercase tracking-[0.07em] transition duration-200 ${
                    active
                      ? "text-white"
                      : "text-[#fff8ee]/80 hover:text-[#dce84c]"
                  }`}
                >
                  {item.label}

                  <span
                      className={`absolute bottom-5 left-3 right-3 h-[3px] origin-left rounded-full bg-[#123f2d] transition-transform duration-300 ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="h-8 w-px bg-white/25" />

          <Link
            href="/account"
            className="rounded-full border border-white/30 px-5 py-3 text-sm font-black uppercase tracking-[0.06em] text-white transition hover:bg-white/10"
          >
            Кабінет
          </Link>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-[#229ed9] px-5 py-3 text-sm font-black uppercase tracking-[0.06em] text-white shadow-[0_8px_20px_rgba(34,158,217,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#188ac0]"
          >
            <TelegramIcon />

            <span>Telegram</span>
          </a>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123f2d] shadow-md transition hover:bg-[#0d3224] xl:hidden"
        >
          <span className="relative block h-5 w-6">
            <span
              className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-white transition duration-300 ${
                menuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-[9px] h-0.5 w-6 rounded-full bg-white transition duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`absolute bottom-0 left-0 h-0.5 w-6 rounded-full bg-white transition duration-300 ${
                menuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/15 bg-[#123f2d] xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 px-4 py-5 sm:px-6">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-5 py-4 text-base font-black uppercase tracking-[0.07em] transition ${
                    active
                      ? "bg-[#f7efe3] text-[#123f2d]"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span>{item.label}</span>

                  <span
                    className={
                      active ? "text-[#bb5a3c]" : "text-[#dce84c]"
                    }
                  >
                    →
                  </span>
                </Link>
              );
            })}

            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-[#dce84c] px-5 py-4 text-base font-black uppercase tracking-[0.07em] text-[#123f2d]"
            >
              <span>Особистий кабінет</span>
              <span>→</span>
            </Link>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-between rounded-2xl bg-[#229ed9] px-5 py-4 text-base font-black uppercase tracking-[0.07em] text-white transition hover:bg-[#188ac0]"
            >
              <span className="flex items-center gap-3">
                <TelegramIcon />
                Telegram
              </span>

              <span>↗</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function TelegramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 fill-current"
    >
      <path d="M21.7 3.3a1.5 1.5 0 0 0-1.55-.24L2.9 9.72a1.4 1.4 0 0 0 .08 2.64l4.35 1.43 1.7 5.15a1.4 1.4 0 0 0 2.42.44l2.42-2.7 4.5 3.3a1.52 1.52 0 0 0 2.38-.92l2.9-14.3a1.5 1.5 0 0 0-.55-1.46ZM9.2 13.05l8.66-5.4-6.92 6.62-.27 2.88-1.47-4.1Z" />
    </svg>
  );
}
