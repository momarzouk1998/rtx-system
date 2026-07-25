'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'مرحلة البيع', href: '/sales-stage', icon: ShoppingCart },
  { name: 'مرحلة التصنيع', href: '/production-stage', icon: Settings },
  { name: 'مرحلة الخامات', href: '/materials-stage', icon: Briefcase },
  { name: 'قائمة الخامات', href: '/materials-list', icon: List },
  { name: 'قائمة المنتجات', href: '/products-list', icon: LayoutList },
  { name: 'قائمة العملاء', href: '/clients-list', icon: Users },
  { name: 'قائمة المصانع', href: '/factories-list', icon: Factory },
  { name: 'قائمة الموردين', href: '/suppliers-list', icon: UserPlus },
  { name: 'متابعة الطلبات', href: '/orders-track', icon: ClipboardList },
  { name: 'المصروفات', href: '/expenses', icon: Coins },
  { name: 'المدفوعات', href: '/payments', icon: Banknote },
  { name: 'خزنة RTX', href: '/treasury', icon: Banknote },
  { name: 'لوحة المتابعة', href: '/', icon: LayoutDashboard },
  { name: 'كشف حساب', href: '/statement', icon: FileText },
  { name: 'قائمة المستخدمين', href: '/users-list', icon: UsersRound },
  { name: 'الصفحة الشخصية', href: '/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // اقفل السايدبار تلقائياً بعد اختيار صفحة على الموبايل
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // منع تمرير الصفحة لما السايدبار مفتوح على الموبايل
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* زر الهمبرغر — يظهر على الموبايل فقط */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="فتح القائمة"
        className="lg:hidden fixed top-4 right-4 z-50 w-11 h-11 flex items-center justify-center rounded-lg bg-[#12829b] text-white shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* خلفية معتمة (overlay) — تظهر لما السايدبار مفتوح على الموبايل */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* السايدبار نفسه */}
      <aside
        className={cn(
          'w-64 h-screen fixed top-0 right-0 bg-[#2b2b2b] text-white border-l border-white/5 flex flex-col z-50 transition-transform duration-300',
          // على الموبايل: ينزلق من اليمين، مغلق افتراضياً
          // على الديسكتوب (lg+): ثابت دائماً
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* الهيدر */}
        <div className="h-20 flex items-center justify-center bg-[#12829b] shadow-md relative z-10 px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="RTX Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-white">
              <span className="text-xl font-bold tracking-wide">RTX</span>
              <span className="text-xs text-white/80">للتجارة والتصنيع</span>
            </div>
          </Link>
          {/* زر الإغلاق على الموبايل */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
            className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar" dir="rtl">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[#12829b]/20 text-[#38bdf8] font-semibold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-[#38bdf8]' : 'text-gray-400')} />
                  <span className="text-sm">{item.name}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 w-1 h-6 bg-[#38bdf8] rounded-l-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-sm">
              <LogOut className="w-5 h-5" />
              <span>خروج</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
