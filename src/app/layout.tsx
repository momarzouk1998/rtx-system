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

async function checkSubscription(): Promise<{ active: boolean; status?: string; daysLeft?: number; graceDaysLeft?: number; message?: string }> {
  try {
    const adminUrl = process.env.ADMIN_API_URL;
    const systemName = process.env.SYSTEM_NAME;
    if (!adminUrl || !systemName) return { active: true }; // Fallback if not configured

    const res = await fetch(`${adminUrl}/api/subscription/verify?system=${systemName}`, {
      next: { revalidate: 60 }, // Cache for 1 minute for faster updates
    });
    
    if (!res.ok) return { active: true };
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Subscription check failed:", error);
    return { active: true }; // Do not block if admin server is unreachable
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const subStatus = await checkSubscription();

  if (!subStatus.active) {
    return (
      <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
        <head>
          <title>System Blocked</title>
        </head>
        <body className="min-h-full flex flex-col items-center justify-center bg-gray-50 font-[var(--font-cairo)] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">انتهت صلاحية الاشتراك</h1>
            <p className="text-gray-600 mb-6">
              {subStatus.message || "عفواً، لقد انتهت صلاحية اشتراك هذا النظام. يرجى التواصل مع الإدارة لتجديد الاشتراك واستعادة الوصول."}
            </p>
          </div>
        </body>
      </html>
    );
  }

  const user = await getCurrentUser();

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[var(--font-cairo)]">
        {subStatus.status === "expiring_soon" && (
          <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-bold w-full shadow-sm z-[9999]">
            {subStatus.message}
          </div>
        )}
        {subStatus.status === "grace_period" && (
          <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-bold w-full shadow-sm z-[9999]">
            {subStatus.message}
          </div>
        )}
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

