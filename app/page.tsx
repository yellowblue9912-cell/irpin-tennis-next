"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const mainCards = [
  {
    title: "Гравці",
    description: "Учасники тенісної спільноти",
    href: "/players",
    accent: "green",
  },
  {
    title: "Турніри",
    description: "Турніри та результати",
    href: "/tournaments",
    accent: "terracotta",
  },
  {
    title: "Рейтинг",
    description: "Актуальний рейтинг гравців",
    href: "/rating",
    accent: "purple",
  },
  {
    title: "Корти",
    description: "Тенісні корти Ірпеня та Бучі",
    href: "/courts",
    accent: "blue",
  },
  {
    title: "Тренери",
    description: "Тренування для дітей і дорослих",
    href: "/coaches",
    accent: "australian",
  },
];

const leagues = [
  {
    name: "Masters",
    href: "/league/masters",
    label: "Досвідчені гравці",
  },
  {
    name: "Challenger",
    href: "/league/challenger",
    label: "Розвиток і конкуренція",
  },
  {
    name: "Ladies",
    href: "/league/ladies",
    label: "Ліга для дівчат",
  },
];

type TennisBallProps = {
  className?: string;
  size?: number;
};

function TennisBall({ className = "", size = 54 }: TennisBallProps) {
  return (
    <div
      className={`tennis-ball relative shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <span className="ball-line ball-line-left" />
      <span className="ball-line ball-line-right" />
    </div>
  );
}

function LivingCursorBall() {
  const ballRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: -100, y: -100 });
  const ballPosition = useRef({ x: -100, y: -100 });
  const animationFrame = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  useEffect(() => {
    const canUseCursor =
      window.matchMedia("(pointer: fine)").matches &&
      window.innerWidth >= 1024 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseCursor) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      setIsVisible(true);

      const target = event.target as HTMLElement;
      const interactiveElement = target.closest(
        "a, button, [data-ball-target]"
      );

      setIsHoveringLink(Boolean(interactiveElement));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const animate = () => {
      const easing = 0.16;

      ballPosition.current.x +=
        (mousePosition.current.x - ballPosition.current.x) * easing;

      ballPosition.current.y +=
        (mousePosition.current.y - ballPosition.current.y) * easing;

      if (ballRef.current) {
        ballRef.current.style.transform = `translate3d(
          ${ballPosition.current.x - 11}px,
          ${ballPosition.current.y - 11}px,
          0
        ) scale(${isHoveringLink ? 1.35 : 1})`;
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isHoveringLink]);

  return (
    <div
      ref={ballRef}
      className={`pointer-events-none fixed left-0 top-0 z-[100] hidden transition-opacity duration-200 lg:block ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <TennisBall size={22} />
    </div>
  );
}

export default function HomePage() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <>
      <LivingCursorBall />

      <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f4f0e5] text-[#173d2b]">
        {/* Wimbledon main section */}
        <section className="relative flex flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9),transparent_52%)]" />

          <div className="pointer-events-none absolute -left-28 top-8 h-80 w-80 rounded-full border border-[#173d2b]/7" />
          <div className="pointer-events-none absolute -left-10 top-24 h-56 w-56 rounded-full border border-[#173d2b]/7" />
          <div className="pointer-events-none absolute -right-36 bottom-0 h-96 w-96 rounded-full border border-[#173d2b]/7" />

          <div className="relative mx-auto flex w-full max-w-[1600px] flex-col px-5 py-6 sm:px-8 lg:py-7 xl:px-12">
            {/* Compact title */}
            <div className="mb-5 flex items-end justify-between gap-6 lg:mb-6">
              <div className="flex items-center gap-4">
                <div className="hero-ball hidden sm:block">
                  <TennisBall size={70} />
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.34em] text-[#6f2f91]">
                    Irpin · Bucha · Kyiv
                  </p>

                  <h1 className="max-w-4xl text-3xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-[#173d2b] sm:text-4xl lg:text-[52px]">
                    Теніс об’єднує
                    <span className="ml-3 text-[#6f2f91]">нас</span>
                  </h1>

                  <p className="mt-2 max-w-xl text-sm font-medium text-[#173d2b]/60">
                    Гравці, турніри, ліги та тенісне життя нашої спільноти.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-3 rounded-full border border-[#173d2b]/10 bg-white/45 px-4 py-2.5 lg:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dfff3f] shadow-[0_0_0_5px_rgba(223,255,63,0.2)]" />

                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#173d2b]/65">
                  Tennis community
                </span>
              </div>
            </div>

            {/* Main navigation grid */}
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {mainCards.slice(0, 2).map((card) => (
                <NavigationCard
                  key={card.href}
                  card={card}
                  activeCard={activeCard}
                  setActiveCard={setActiveCard}
                />
              ))}

              {/* League card */}
              <article
                className={`group relative overflow-hidden rounded-[22px] border p-4 transition-all duration-500 md:col-span-2 xl:col-span-1 ${
                  activeCard === "Ліги"
                    ? "-translate-y-1 border-[#6f2f91]/40 bg-[#6f2f91] shadow-[0_24px_55px_rgba(74,31,97,0.22)]"
                    : "border-[#173d2b]/10 bg-[#173d2b]"
                }`}
                onMouseEnter={() => setActiveCard("Ліги")}
                onMouseLeave={() => setActiveCard(null)}
                data-ball-target
              >
                <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />

                <div className="relative flex h-full min-h-[142px] flex-col">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dfff3f]">
                        Наші ліги
                      </span>

                      <h2 className="mt-1 text-xl font-black uppercase tracking-[-0.04em] text-white">
                        Ліги
                      </h2>
                    </div>

                    <div className="league-ball transition-transform duration-500 group-hover:rotate-[24deg] group-hover:scale-110">
                      <TennisBall size={38} />
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                    {leagues.map((league) => (
                      <Link
                        key={league.href}
                        href={league.href}
                        className="group/league flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 transition hover:border-[#dfff3f]/50 hover:bg-[#dfff3f]"
                        data-ball-target
                      >
                        <div>
                          <div className="text-sm font-black uppercase text-white transition group-hover/league:text-[#173d2b]">
                            {league.name}
                          </div>

                          <div className="mt-0.5 text-[10px] font-semibold text-white/45 transition group-hover/league:text-[#173d2b]/60">
                            {league.label}
                          </div>
                        </div>

                        <span className="text-lg text-white/55 transition group-hover/league:translate-x-1 group-hover/league:text-[#173d2b]">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>

              {mainCards.slice(2).map((card) => (
                <NavigationCard
                  key={card.href}
                  card={card}
                  activeCard={activeCard}
                  setActiveCard={setActiveCard}
                />
              ))}
            </div>
          </div>
        </section>

        {/* US Open / Australian Open footer */}
        <footer className="relative overflow-hidden bg-[#08285d] text-white">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#e74b35] via-[#2b9df4] to-[#dfff3f]" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -right-10 -top-20 h-44 w-44 rounded-full bg-[#1495e8]/10" />

          <div className="relative mx-auto flex min-h-[88px] max-w-[1600px] flex-col items-center justify-between gap-4 px-5 py-5 sm:flex-row sm:px-8 xl:px-12">
            <div className="flex items-center gap-3">
              <TennisBall size={30} />

              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em]">
                  Irpin Tennis
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Play · Compete · Connect
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-white/65">
              <a
                href="https://t.me/+9RoKqlUk7VE3NTFi"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#dfff3f]"
                data-ball-target
              >
                Telegram
              </a>

              <Link
                href="/coaches"
                className="transition hover:text-[#dfff3f]"
                data-ball-target
              >
                Тренери
              </Link>

              <Link
                href="/courts"
                className="transition hover:text-[#dfff3f]"
                data-ball-target
              >
                Корти
              </Link>

              <span className="text-white/30">© 2026 IRPIN TENNIS</span>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f4f0e5;
        }

        .tennis-ball {
          overflow: hidden;
          background:
            radial-gradient(
              circle at 35% 30%,
              rgba(255, 255, 255, 0.7),
              transparent 22%
            ),
            radial-gradient(
              circle at 65% 72%,
              rgba(104, 137, 0, 0.38),
              transparent 42%
            ),
            #dfff3f;
          box-shadow:
            inset -5px -7px 12px rgba(71, 100, 0, 0.2),
            inset 4px 4px 9px rgba(255, 255, 255, 0.48),
            0 12px 24px rgba(24, 61, 43, 0.18);
        }

        .ball-line {
          position: absolute;
          display: block;
          width: 47%;
          height: 78%;
          border-color: rgba(255, 255, 255, 0.92);
          border-style: solid;
          border-width: 0;
        }

        .ball-line-left {
          left: -17%;
          top: 10%;
          border-right-width: 2px;
          border-radius: 0 100% 100% 0;
          transform: rotate(-8deg);
        }

        .ball-line-right {
          right: -17%;
          top: 10%;
          border-left-width: 2px;
          border-radius: 100% 0 0 100%;
          transform: rotate(-8deg);
        }

        .hero-ball {
          animation: hero-ball-bounce 3.6s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .league-ball {
          animation: league-ball-float 4s ease-in-out infinite;
        }

        @keyframes hero-ball-bounce {
          0%,
          72%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          78% {
            transform: translateY(-13px) rotate(10deg);
          }

          84% {
            transform: translateY(0) rotate(19deg) scaleY(0.92);
          }

          89% {
            transform: translateY(-5px) rotate(24deg);
          }

          94% {
            transform: translateY(0) rotate(30deg);
          }
        }

        @keyframes league-ball-float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-5px) rotate(12deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (min-width: 1280px) and (min-height: 900px) {
          main {
            height: 100vh;
          }
        }
      `}</style>
    </>
  );
}

type NavigationCardProps = {
  card: {
    title: string;
    description: string;
    href: string;
    accent: string;
  };
  activeCard: string | null;
  setActiveCard: (value: string | null) => void;
};

function NavigationCard({
  card,
  activeCard,
  setActiveCard,
}: NavigationCardProps) {
  const isActive = activeCard === card.title;

  const activeBackgrounds: Record<string, string> = {
    green: "bg-[#173d2b]",
    terracotta: "bg-[#b65b3d]",
    purple: "bg-[#6f2f91]",
    blue: "bg-[#08285d]",
    australian: "bg-[#168ed1]",
  };

  return (
    <Link
      href={card.href}
      className={`group relative min-h-[142px] overflow-hidden rounded-[22px] border p-4 transition-all duration-500 ${
        isActive
          ? `-translate-y-1 border-transparent ${
              activeBackgrounds[card.accent]
            } shadow-[0_24px_55px_rgba(24,61,43,0.18)]`
          : "border-[#173d2b]/10 bg-white/65 hover:border-[#173d2b]/20"
      }`}
      onMouseEnter={() => setActiveCard(card.title)}
      onMouseLeave={() => setActiveCard(null)}
      data-ball-target
    >
      <div
        className={`pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full border transition duration-500 ${
          isActive ? "border-white/10" : "border-[#173d2b]/6"
        }`}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-end">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-all duration-300 group-hover:rotate-[-12deg] ${
              isActive
                ? "border-white/20 bg-white/10 text-white"
                : "border-[#173d2b]/10 text-[#173d2b]"
            }`}
          >
            ↗
          </span>
        </div>

        <div>
          <h2
            className={`text-xl font-black uppercase tracking-[-0.04em] transition sm:text-2xl ${
              isActive ? "text-white" : "text-[#173d2b]"
            }`}
          >
            {card.title}
          </h2>

          <p
            className={`mt-1 text-xs font-semibold transition ${
              isActive ? "text-white/60" : "text-[#173d2b]/50"
            }`}
          >
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
