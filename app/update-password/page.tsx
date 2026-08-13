import type { Metadata } from "next";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Новий пароль | Irpin Tennis",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:py-20">
      <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ad4529]">Особистий кабінет</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Новий пароль</h1>
        <p className="mt-4 leading-7 text-[#123f2d]/65">Встановіть новий пароль довжиною щонайменше 8 символів.</p>
        <UpdatePasswordForm />
      </div>
    </main>
  );
}
