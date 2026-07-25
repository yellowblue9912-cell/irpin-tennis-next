import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../lib/adminAuth";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-[#f6f0e5] px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d7f34c] text-xl font-black text-[#123f2d]">
          IT
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#ad4529]">
          Захищений розділ
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase text-[#123f2d]">
          Вхід адміністратора
        </h1>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            Неправильний логін або пароль.
          </p>
        )}

        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-black">
              Логін
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none focus:border-[#123f2d]"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-black">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-[#123f2d]/15 bg-[#f6f0e5] px-4 py-3 outline-none focus:border-[#123f2d]"
            />
          </div>
          <button className="w-full rounded-xl bg-[#123f2d] px-5 py-3 font-black text-white transition hover:bg-[#1b5a41]">
            Увійти
          </button>
        </form>
      </section>
    </main>
  );
}
