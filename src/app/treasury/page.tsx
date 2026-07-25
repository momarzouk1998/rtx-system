'use client';

import { motion } from 'framer-motion';
import { Banknote, Plus, Search, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const mockTransactions = [
  { id: '1', date: '2026-07-08', category: 'دفع من العملاء', description: 'سداد دفعة من شركة الأمل', amount: 50000, type: 'IN' },
  { id: '2', date: '2026-07-07', category: 'دفع لصالح الموردين', description: 'شراء مواد خام - مورد النور', amount: 15000, type: 'OUT' },
  { id: '3', date: '2026-07-06', category: 'مصاريف يومية', description: 'مصاريف نقل وتوصيل', amount: 1200, type: 'OUT' },
  { id: '4', date: '2026-07-05', category: 'مبيعات نقدية', description: 'مبيعات نقدية فورية', amount: 12500, type: 'IN' },
  { id: '5', date: '2026-07-01', category: 'مرتبات', description: 'مرتبات شهر يونيو', amount: 25000, type: 'OUT' },
];

export default function Treasury() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#38bdf8] flex items-center gap-2">
            <Wallet className="text-[#38bdf8]" /> خزنة RTX
          </h2>
          <p className="mt-1 text-gray-400">إدارة السيولة النقدية، المصاريف اليومية، والمرتبات</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium border border-red-500/30">
            <TrendingDown className="w-5 h-5" />
            <span>تسجيل منصرف</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium border border-green-500/30">
            <TrendingUp className="w-5 h-5" />
            <span>تسجيل وارد</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-dark p-6 rounded-xl border-l-4 border-[#38bdf8]">
          <p className="text-gray-400 text-sm">الرصيد الحالي بالخزينة</p>
          <h3 className="text-4xl font-bold text-[#38bdf8] mt-2">342,000 EGP</h3>
        </div>
        <div className="glass-dark p-6 rounded-xl border-l-4 border-green-400">
          <p className="text-gray-400 text-sm">إجمالي الوارد (هذا الشهر)</p>
          <h3 className="text-3xl font-bold text-[#38bdf8] mt-2">62,500 EGP</h3>
        </div>
        <div className="glass-dark p-6 rounded-xl border-l-4 border-red-400">
          <p className="text-gray-400 text-sm">إجمالي المنصرف (هذا الشهر)</p>
          <h3 className="text-3xl font-bold text-[#38bdf8] mt-2">41,200 EGP</h3>
        </div>
      </div>

      <div className="glass-dark rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-white/10 flex justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-[#38bdf8]">تقرير حركة الخزينة (فلترة بالتاريخ)</h3>
          <div className="flex gap-4">
            <input 
              type="date" 
              className="bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#38bdf8]"
            />
            <button className="bg-[#12829b] text-white px-4 py-2 rounded-lg hover:bg-[#107085] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-black/40 text-[#38bdf8] text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">التصنيف</th>
                <th className="px-6 py-4 font-medium">البيان</th>
                <th className="px-6 py-4 font-medium">الوارد</th>
                <th className="px-6 py-4 font-medium">المنصرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {mockTransactions.map((trx, i) => (
                <motion.tr 
                  key={trx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4" dir="ltr">{trx.date}</td>
                  <td className="px-6 py-4 text-white">{trx.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{trx.description}</td>
                  <td className="px-6 py-4 font-bold text-green-400" dir="ltr">
                    {trx.type === 'IN' ? `+${trx.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-red-400" dir="ltr">
                    {trx.type === 'OUT' ? `-${trx.amount.toLocaleString()}` : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
