'use client';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Plus } from 'lucide-react';

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#38bdf8] flex items-center gap-2">
            <ClipboardList className="text-[#38bdf8]" /> متابعة الطلبات
          </h2>
          <p className="mt-1 text-gray-400">تتبع حالات طلبات العملاء قيد التنفيذ</p>
        </div>
      </div>
      <div className="glass-dark p-12 rounded-xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-[#38bdf8] mb-4">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#38bdf8]">الواجهة جاهزة للربط</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          تم تصميم الهيكل الأساسي لهذه الواجهة وهي جاهزة لربطها بقاعدة البيانات الخاصة بك فور اعتمادك للتصميم النهائي.
        </p>
      </div>
    </div>
  );
}