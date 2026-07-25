import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

import { ToastProvider } from "@/components/ToastProvider";

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: '--font-cairo',
});

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
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[var(--font-cairo)]">
        <ToastProvider />
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 min-w-0 max-w-full p-3 pt-16 md:p-6 md:pt-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

