import { redirect } from "next/navigation";
import AuthForm from "../../components/AuthForm";
import { createClient } from "../../lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/account");
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-20">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Особистий кабінет
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-tight sm:text-5xl">
          Ваш тенісний профіль
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#123f2d]/65">
          Оновлюйте фото та інформацію про себе, керуйте приватністю контактів
          і переглядайте статистику матчів та турнірів.
        </p>

        <div className="mt-6 max-w-xl rounded-2xl border border-[#123f2d]/10 bg-white p-4 shadow-sm sm:p-5">
          <p className="font-black text-[#123f2d]">
            Що робити після реєстрації?
          </p>
          <p className="mt-2 text-sm leading-6 text-[#123f2d]/65">
            Надішліть email, з яким ви створили акаунт, адміністратору в
            Telegram. Ми створимо для вас нову картку гравця або прив’яжемо
            акаунт до картки, яка вже є на сайті.
          </p>
          <a
            href="https://t.me/prybalski"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-full bg-[#229ed9] px-4 py-2 text-sm font-black text-white"
          >
            Написати @prybalski
          </a>
        </div>
      </section>
      <AuthForm />
    </main>
  );
}
