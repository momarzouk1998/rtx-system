'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Settings,
  Briefcase,
  List,
  LayoutList,
  Users,
  Factory,
  UserPlus,
  ClipboardList,
  Coins,
  Banknote,
  LayoutDashboard,
  FileText,
  UsersRound,
  UserCircle,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { name: 'لوحة المتابعة', href: '/', icon: LayoutDashboard, emoji: '📊' },
  { name: 'مرحلة البيع', href: '/sales-stage', icon: ShoppingCart, emoji: '🛒' },
  { name: 'مرحلة التصنيع', href: '/production-stage', icon: Settings, emoji: '⚙️' },
  { name: 'مرحلة الخامات', href: '/materials-stage', icon: Briefcase, emoji: '📦' },
  { name: 'قائمة الخامات', href: '/materials-list', icon: List, emoji: '📋' },
  { name: 'قائمة المنتجات', href: '/products-list', icon: LayoutList, emoji: '🏷️' },
  { name: 'قائمة العملاء', href: '/clients-list', icon: Users, emoji: '👥' },
  { name: 'قائمة المصانع', href: '/factories-list', icon: Factory, emoji: '🏭' },
  { name: 'قائمة الموردين', href: '/suppliers-list', icon: UserPlus, emoji: '🏢' },
  { name: 'متابعة الطلبات', href: '/orders-track', icon: ClipboardList, emoji: '📑' },
  { name: 'المصروفات', href: '/expenses', icon: Coins, emoji: '💸' },
  { name: 'المدفوعات', href: '/payments', icon: Banknote, emoji: '💰' },
  { name: 'خزنة RTX', href: '/treasury', icon: Banknote, emoji: '🏦' },
  { name: 'كشف حساب', href: '/statement', icon: FileText, emoji: '📄' },
  { name: 'قائمة المستخدمين', href: '/users-list', icon: UsersRound, emoji: '👨‍👩‍👧' },
  { name: 'الصفحة الشخصية', href: '/profile', icon: UserCircle, emoji: '👤' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // أغلق الـ drawer عند تغيير الصفحة
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // قفل/فتح scroll الـ body عند فتح الـ drawer
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // إغلاق بـ ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-header-gradient text-white px-3 py-2.5 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-2xl shrink-0"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? '✕' : '☰'}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
            <Image src="/RTX LOGO.png" alt="RTX Logo" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <div className="font-bold text-sm truncate">RTX System</div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-[280px] max-w-[85vw] bg-header-gradient text-white shadow-2xl flex flex-col animate-slide-in"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                  <Image src="/RTX LOGO.png" alt="RTX Logo" width={40} height={40} className="object-contain w-full h-full" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm leading-tight truncate">RTX System</div>
                  <div className="text-[10px] text-[#38bdf8] font-medium">للتجارة والتصنيع</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl"
                aria-label="إغلاق"
              >✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent menuItems={menuItems} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="p-3 border-t border-white/10">
              <Link href="/profile" onClick={() => setOpen(false)} className="block w-full py-2.5 rounded-lg bg-[#12829b]/20 text-[#38bdf8] hover:bg-[#12829b]/30 text-sm font-medium text-center mb-2">
                👤 الملف الشخصي
              </Link>
              <button onClick={logout} className="w-full py-2.5 rounded-lg bg-red-500/20 text-red-100 hover:bg-red-500/30 text-sm font-medium">
                🚪 تسجيل خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-header-gradient text-white h-screen sticky top-0 shadow-2xl shrink-0">
        <SidebarContent menuItems={menuItems} pathname={pathname} onNavigate={() => {}} />
        <div className="p-4 border-t border-white/10">
          <Link href="/profile" className="block w-full py-2 rounded-lg bg-[#12829b]/20 text-[#38bdf8] hover:bg-[#12829b]/30 text-sm text-center mb-2">
            👤 الملف الشخصي
          </Link>
          <button onClick={logout} className="w-full py-2 rounded-lg bg-red-500/20 text-red-100 hover:bg-red-500/30 text-sm">
            🚪 تسجيل خروج
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarContent({ menuItems, pathname, onNavigate }: { menuItems: any[]; pathname: string; onNavigate: () => void }) {
  const activeItem = menuItems.reduce<any | null>((best, item) => {
    if (pathname === item.href) return item;
    if (pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) return item;
    }
    return best;
  }, null);

  return (
    <>
      <div className="p-4 border-b-4 border-[#12829b] flex items-center gap-3 hidden md:flex">
        <div className="w-12 h-12 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
          <Image src="/RTX LOGO.png" alt="RTX Logo" width={48} height={48} className="object-contain w-full h-full" />
        </div>
        <div>
          <div className="font-extrabold text-base leading-tight">RTX System</div>
          <div className="text-[10px] text-[#38bdf8] font-medium">للتجارة والتصنيع</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const active = activeItem?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 mx-2 my-0.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-[#12829b] text-white shadow-md font-bold'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white active:bg-white/5'
              }`}
            >
              <span className="text-lg shrink-0">{item.emoji}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
