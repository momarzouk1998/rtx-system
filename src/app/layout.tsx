import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RTX System - Dashboard",
  description: "Professional Management System for RTX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950`}>
        <ToastProvider />
        <div className="flex h-screen overflow-hidden">
          {/* Main content wrapper */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 transition-all">
            {/* padding: أقل على الموبايل (pt-16 عشان زر الهمبرغر)، أكبر على الديسكتوب */}
            <div className="w-full p-4 pt-16 pb-4 lg:p-6 lg:pt-6 lg:mr-64">
              {children}
            </div>
          </main>

          <Sidebar />
        </div>
      </body>
    </html>
  );
}

