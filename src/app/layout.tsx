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
          <main className="flex-1 overflow-y-auto mr-64 bg-slate-50 dark:bg-zinc-950 transition-all">
            {/* Header placeholder if needed later */}
            <div className="w-full p-8 pb-4">
              {children}
            </div>
          </main>
          
          <Sidebar />
        </div>
      </body>
    </html>
  );
}

