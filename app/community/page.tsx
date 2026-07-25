import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

const telegramUrl = "https://t.me/+9RoKqlUk7VE3NTFi";

export const metadata: Metadata = {
  title: "Telegram-спільнота гравців | Irpin Tennis",
  description:
    "Закрита Telegram-спільнота тенісистів Ірпеня та Бучі для зареєстрованих учасників Irpin Tennis.",
  robots: { index: false, follow: false },
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);
  const { data: player } = data.user
    ? await supabase
        .from("players")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle()
    : { data: null };
  const isCommunityMember = Boolean(player);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-4xl items-center px-4 py-10 sm:px-6 md:py-16">
      <section className="w-full overflow-hidden rounded-[28px] border border-[#123f2d]/10 bg-white shadow-[0_24px_70px_rgba(18,63,45,0.12)]">
        <div className="bg-[#229ed9] px-6 py-7 text-white sm:px-10 sm:py-9">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">
            Irpin Tennis Community
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-4xl">
            Telegram-спільнота
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/85 sm:text-base">
            Закритий чат гравців з Ірпеня та Бучі: пошук партнерів,
            домовленості про матчі, турніри й тенісні новини.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-10 sm:py-9">
          {isCommunityMember ? (
            <>
              <h2 className="text-2xl font-black text-[#123f2d]">
                Вашу картку гравця підтверджено
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#123f2d]/65">
                Тепер можна перейти до Telegram-групи. Після переходу
                надішліть заявку на вступ — адміністратор її підтвердить.
              </p>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#229ed9] px-6 py-3 font-black uppercase tracking-[0.05em] text-white shadow-[0_10px_24px_rgba(34,158,217,0.25)] transition hover:bg-[#188ac0]"
              >
                Перейти в Telegram
              </a>
            </>
          ) : isAuthenticated ? (
            <>
              <h2 className="text-2xl font-black text-[#123f2d]">
                Акаунт ще не прив’язаний до гравця
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#123f2d]/65">
                Надішліть адміністратору email, з яким ви зареєструвалися.
                Після перевірки ми створимо картку гравця або прив’яжемо
                акаунт до картки, яка вже є на сайті. Тоді тут автоматично
                з’явиться кнопка переходу до групи.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://t.me/prybalski"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#229ed9] px-6 py-3 font-black uppercase tracking-[0.05em] text-white transition hover:bg-[#188ac0]"
                >
                  Надіслати email — @prybalski
                </a>
                <Link
                  href="/account"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#123f2d]/15 px-6 py-3 font-black uppercase tracking-[0.05em] text-[#123f2d] transition hover:bg-[#f6f0e5]"
                >
                  Відкрити кабінет
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-[#123f2d]">
                Спочатку зареєструйтеся
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#123f2d]/65">
                Посилання на чат доступне гравцям Irpin Tennis із
                підтвердженою карткою. Створіть безкоштовний акаунт або
                увійдіть, а потім надішліть адміністратору email для
                прив’язування вашої картки гравця.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c9f52f] px-6 py-3 font-black uppercase tracking-[0.05em] text-[#123f2d] transition hover:bg-[#b9e51f]"
                >
                  Зареєструватися або увійти
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#123f2d]/15 px-6 py-3 font-black uppercase tracking-[0.05em] text-[#123f2d] transition hover:bg-[#f6f0e5]"
                >
                  Повернутися на головну
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
