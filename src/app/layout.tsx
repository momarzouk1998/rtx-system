import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth-server";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

import { ToastProvider } from "@/components/ToastProvider";

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: "RTX System - نظام إدارة RTX",
  description: "نظام الإدارة المتكامل لشركة RTX للتجارة والتصنيع",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "RTX System", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/icon-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/icon-512x512.png", sizes: "512x512" },
    ],
  },
  openGraph: {
    title: "RTX System",
    description: "نظام الإدارة المتكامل لشركة RTX للتجارة والتصنيع",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[var(--font-cairo)]">
        <ToastProvider />
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar user={user} />
          <main className="flex-1 min-w-0 max-w-full p-3 pt-16 md:p-6 md:pt-6 overflow-x-hidden">
            {children}
          </main>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

