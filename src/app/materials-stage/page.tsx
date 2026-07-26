'use client';

import { motion } from 'framer-motion';
import { Briefcase, Save } from 'lucide-react';

export default function MaterialsStage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#38bdf8] flex items-center gap-2">
            <Briefcase className="text-[#38bdf8]" /> مرحلة الخامات (شراء وتوريد)
          </h2>
          <p className="mt-1 text-gray-400">تسجيل توريد مواد خام جديدة للمخزن وإضافة القيمة على المورد</p>
        </div>
      </div>

      <div className="glass-dark p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">تاريخ التوريد</label>
            <input type="date" className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-[#38bdf8]" defaultValue="2026-07-08" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">المورد</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-[#38bdf8]">
              <option value="">اختر المورد...</option>
              <option value="1">شركة البتروكيماويات</option>
              <option value="2">مورد النور للبلاستيك</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">الخامة الموردة</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-[#38bdf8]">
              <option value="">اختر الخامة...</option>
              <option value="1">بولي إيثيلين</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">الكمية (بالكيلو)</label>
            <input type="number" placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-[#38bdf8]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">سعر الكيلو</label>
            <input type="number" placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-[#38bdf8]" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xl font-bold text-white">
          <span>إجمالي الفاتورة:</span>
          <span className="text-amber-400">0.00</span>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#12829b] hover:bg-[#107085] text-white rounded-lg font-bold mt-4">
          <Save className="w-5 h-5" /> حفظ واعتماد إضافة الخامات
        </button>
      </div>
    </div>
  );
}
