export default function Footer() {
  return (
    <footer className="mt-16 bg-[#172447] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left">
        <div>
          <h3 className="text-lg font-black uppercase tracking-[0.15em]">
            IRPIN TENNIS
          </h3>

          <p className="mt-2 text-sm text-white/60">
            Тенісна спільнота Ірпеня • Бучі • Передмістя
          </p>
        </div>

        <div className="text-sm text-white/50">
          © {new Date().getFullYear()} Irpin Tennis
        </div>
      </div>
    </footer>
  );
}
