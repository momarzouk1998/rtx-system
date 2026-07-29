'use client';

import { motion } from 'framer-motion';
import { Banknote, Plus, Search, TrendingUp, TrendingDown, Wallet, Edit2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTreasuryData, setOpeningBalance } from '../actions/treasury';

type Transaction = {
  id: string;
  date: Date;
  dateString: string;
  category: string;
  description: string;
  amount: number;
  type: 'IN' | 'OUT';
};

export default function Treasury() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthIn, setMonthIn] = useState(0);
  const [monthOut, setMonthOut] = useState(0);
  const [openingBalanceVal, setOpeningBalanceVal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [newOpeningBalance, setNewOpeningBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await getTreasuryData();
      setTransactions(data.transactions);
      setCurrentBalance(data.currentBalance);
      setOpeningBalanceVal(data.openingBalance);
      setMonthIn(data.monthIn);
      setMonthOut(data.monthOut);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSetOpeningBalance = async () => {
    if (!newOpeningBalance) return;
    setSaving(true);
    const amount = parseFloat(newOpeningBalance);
    const res = await setOpeningBalance(amount);
    if (res.success) {
      setShowOpeningModal(false);
      setNewOpeningBalance('');
      // reload data
      const data = await getTreasuryData();
      setTransactions(data.transactions);
      setCurrentBalance(data.currentBalance);
      setOpeningBalanceVal(data.openingBalance);
      setMonthIn(data.monthIn);
      setMonthOut(data.monthOut);
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#38bdf8] flex items-center gap-2">
            <Wallet className="text-[#38bdf8]" /> خزنة RTX
          </h2>
          <p className="mt-1 text-sm md:text-base text-gray-400">إدارة السيولة النقدية، المصاريف اليومية، والمرتبات</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <Link href="/expenses" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium border border-red-500/30">
            <TrendingDown className="w-5 h-5" />
            <span>تسجيل منصرف</span>
          </Link>
          <Link href="/payments" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium border border-green-500/30">
            <TrendingUp className="w-5 h-5" />
            <span>تسجيل وارد</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-dark p-4 md:p-6 rounded-xl border-l-4 border-[#38bdf8] relative group">
          <button 
            onClick={() => setShowOpeningModal(true)}
            className="absolute top-4 left-4 p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="تعديل الرصيد الافتتاحي"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <p className="text-gray-400 text-xs md:text-sm">الرصيد الحالي بالخزينة</p>
          <h3 className="text-2xl md:text-4xl font-bold text-[#38bdf8] mt-2 break-words">
            {loading ? '...' : currentBalance.toLocaleString()}
          </h3>
        </div>
        <div className="glass-dark p-4 md:p-6 rounded-xl border-l-4 border-green-400">
          <p className="text-gray-400 text-xs md:text-sm">إجمالي الوارد (هذا الشهر)</p>
          <h3 className="text-xl md:text-3xl font-bold text-[#38bdf8] mt-2 break-words">
            {loading ? '...' : monthIn.toLocaleString()}
          </h3>
        </div>
        <div className="glass-dark p-4 md:p-6 rounded-xl border-l-4 border-red-400">
          <p className="text-gray-400 text-xs md:text-sm">إجمالي المنصرف (هذا الشهر)</p>
          <h3 className="text-xl md:text-3xl font-bold text-[#38bdf8] mt-2 break-words">
            {loading ? '...' : monthOut.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="glass-dark rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg md:text-xl font-semibold text-[#38bdf8]">تقرير حركة الخزينة</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="date" 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="flex-1 md:w-auto bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#38bdf8]"
            />
            <button 
              onClick={() => setDateFilter('')}
              className="bg-[#12829b] text-white px-4 py-2 rounded-lg hover:bg-[#107085] transition-colors shrink-0"
              title={dateFilter ? 'مسح الفلتر' : 'بحث'}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap min-w-[600px]">
            <thead className="bg-black/40 text-[#38bdf8] text-sm">
              <tr>
                <th className="px-4 md:px-6 py-4 font-medium">التاريخ</th>
                <th className="px-4 md:px-6 py-4 font-medium">التصنيف</th>
                <th className="px-4 md:px-6 py-4 font-medium">البيان</th>
                <th className="px-4 md:px-6 py-4 font-medium">الوارد</th>
                <th className="px-4 md:px-6 py-4 font-medium">المنصرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    لا توجد حركات
                  </td>
                </tr>
              ) : transactions
                  .filter(t => !dateFilter || t.dateString === dateFilter)
                  .map((trx, i) => (
                <motion.tr 
                  key={trx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4" dir="ltr">{trx.dateString}</td>
                  <td className="px-4 md:px-6 py-4 text-white">{trx.category}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-400 whitespace-normal min-w-[200px]">{trx.description}</td>
                  <td className="px-4 md:px-6 py-4 font-bold text-green-400" dir="ltr">
                    {trx.type === 'IN' ? `+${trx.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 md:px-6 py-4 font-bold text-red-400" dir="ltr">
                    {trx.type === 'OUT' ? `-${trx.amount.toLocaleString()}` : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opening Balance Modal */}
      {showOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a24] p-6 rounded-xl shadow-xl max-w-md w-full border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">الرصيد الافتتاحي</h3>
              <button onClick={() => setShowOpeningModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">المبلغ</label>
                <input 
                  type="number"
                  value={newOpeningBalance}
                  onChange={e => setNewOpeningBalance(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#38bdf8]"
                  placeholder={`الرصيد الحالي المسجل: ${openingBalanceVal}`}
                />
              </div>
              <button 
                onClick={handleSetOpeningBalance}
                disabled={saving || !newOpeningBalance}
                className="w-full bg-[#12829b] text-white py-2 rounded-lg font-medium hover:bg-[#107085] transition-colors disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ الرصيد الافتتاحي'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
