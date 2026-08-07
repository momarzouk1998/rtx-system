'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  Download,
} from 'lucide-react';

const menuItems = [
  { name: 'لوحة المتابعة', href: '/', icon: LayoutDashboard, emoji: '📊' },
  { name: 'إدارة المخازن', href: '/inventory', icon: Briefcase, emoji: '🏬' },
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
  { name: 'الصفحة الشخصية', href: '/profile', icon: UserCircle, emoji: '👤' },
];

export function Sidebar({ user }: { user?: { name?: string, role?: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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

  if (pathname === '/login') {
    return null;
  }

  const displayMenuItems = [...menuItems];
  if (user?.role === 'MANAGER') {
    displayMenuItems.splice(displayMenuItems.length - 1, 0, { name: 'المستخدمين', href: '/users-list', icon: UsersRound as any, emoji: '👨‍👩‍👧' });
  }

  const triggerInstall = () => {
    const event = new Event('prompt-install');
    window.dispatchEvent(event);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-header-gradient text-white px-3 py-2.5 flex items-center justify-between shadow-lg no-print print:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-2xl shrink-0"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? '✕' : '☰'}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center overflow-hidden">
            <Image src="/rtx-logo.png" alt="RTX Logo" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <div className="font-bold text-sm truncate">RTX System</div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm no-print print:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-[280px] max-w-[85vw] bg-header-gradient text-white shadow-2xl flex flex-col animate-slide-in no-print print:hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
                  <Image src="/rtx-logo.png" alt="RTX Logo" width={40} height={40} className="object-contain w-full h-full" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm leading-tight truncate">RTX System</div>
                  <div className="text-[10px] text-[#38bdf8] font-medium">{user?.name || 'للتجارة والتصنيع'}</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl"
                aria-label="إغلاق"
              >✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent menuItems={displayMenuItems} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>

            {/* Mobile Bottom Row: Install App + Logout */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={triggerInstall}
                className="flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-bold transition-all"
                title="تثبيت التطبيق"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت</span>
              </button>
              <button
                onClick={logout}
                className="py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-200 text-xs font-bold transition-all shrink-0"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span>خروج</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-header-gradient text-white fixed right-0 top-0 bottom-0 shadow-2xl shrink-0 no-print print:hidden overflow-hidden">
        <SidebarContent menuItems={displayMenuItems} pathname={pathname} onNavigate={() => {}} userName={user?.name} />

        {/* Desktop Bottom Row: Install App + Logout */}
        <div className="p-3.5 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={() => {
              const event = new Event('prompt-install');
              window.dispatchEvent(event);
            }}
            className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-bold transition-all cursor-pointer"
            title="تثبيت التطبيق"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت</span>
          </button>
          <button
            onClick={logout}
            className="py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-200 text-xs font-bold transition-all cursor-pointer shrink-0"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarContent({ menuItems, pathname, onNavigate, userName }: { menuItems: any[]; pathname: string; onNavigate: () => void; userName?: string }) {
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
        <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
          <Image src="/rtx-logo.png" alt="RTX Logo" width={48} height={48} className="object-contain w-full h-full" />
        </div>
        <div>
          <div className="font-extrabold text-base leading-tight">RTX System</div>
          <div className="text-[10px] text-[#38bdf8] font-medium">{userName || 'للتجارة والتصنيع'}</div>
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
