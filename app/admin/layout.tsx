import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f0e5] text-[#123f2d]">
      <AdminSidebar />

      <div className="lg:pl-72">
        <header className="border-b border-[#123f2d]/10 bg-white/80 px-5 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad4529]">
                Панель керування
              </p>

              <p className="mt-1 font-bold text-[#123f2d]/55">
                Керування тенісною лігою
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7f34c] font-black">
              A
            </div>
          </div>
        </header>

        <div className="px-5 py-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}