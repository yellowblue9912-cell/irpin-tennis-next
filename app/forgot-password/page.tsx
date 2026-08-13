import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Відновлення пароля | Irpin Tennis",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:py-20">
      <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">Особистий кабінет</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Відновлення пароля</h1>
        <p className="mt-4 leading-7 text-[#123f2d]/65">Введіть пошту, з якою зареєстрований кабінет. Ми надішлемо безпечне посилання для встановлення нового пароля.</p>
        <ForgotPasswordForm />
        <Link href="/login" className="mt-6 block text-center text-sm font-bold text-[#123f2d]/65 underline underline-offset-4">← Повернутися до входу</Link>
      </div>
    </main>
  );
}
