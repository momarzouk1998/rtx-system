'use client';

import { motion } from 'framer-motion';
import { Banknote, Plus, TrendingUp, TrendingDown, Wallet, Edit2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getTreasuryData, setOpeningBalance } from '../actions/treasury';
import { formatNumber } from '@/lib/utils';

const PAGE_SIZE = 20;

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
  const [textFilter, setTextFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ملاحظة: البحث/التقسيم لصفحات هنا للعرض فقط - الإجماليات (الرصيد الحالي، الوارد/المنصرف الشهري)
  // بتفضل محسوبة دايمًا من كل الحركات زي ما هي، من غير أي تأثير من الفلترة أو التقسيم.
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFilter && t.dateString !== dateFilter) return false;
      if (textFilter) {
        const needle = textFilter.trim().toLowerCase();
        if (!t.category.toLowerCase().includes(needle) && !t.description.toLowerCase().includes(needle)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, dateFilter, textFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  // لو الفلترة قللت عدد النتائج وبقت الصفحة الحالية خارج النطاق، نرجع لأول صفحة بدون useEffect
  const effectivePage = Math.min(currentPage, totalPages);
  const pageStart = (effectivePage - 1) * PAGE_SIZE;
  const pagedTransactions = filteredTransactions.slice(pageStart, pageStart + PAGE_SIZE);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#12829b]" />
            خزنة RTX
          </h1>
          <p className="mt-1 text-sm text-gray-500">إدارة السيولة النقدية، المصاريف اليومية، والمرتبات</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Link 
            href="/expenses" 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium border border-red-200 text-sm shadow-xs"
          >
            <TrendingDown className="w-4 h-4" />
            <span>تسجيل منصرف</span>
          </Link>
          <Link 
            href="/payments" 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors font-medium border border-emerald-200 text-sm shadow-xs"
          >
            <TrendingUp className="w-4 h-4" />
            <span>تسجيل وارد</span>
          </Link>
        </div>
      </div>

      {/* ملخص الخزينة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group">
          <button 
            onClick={() => setShowOpeningModal(true)}
            className="absolute top-4 left-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
            title="تعديل الرصيد الافتتاحي"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium text-gray-500">الرصيد الحالي بالخزينة</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#12829b] mt-2 break-words">
            {loading ? '...' : formatNumber(currentBalance)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-medium text-gray-500">إجمالي الوارد (هذا الشهر)</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 break-words">
            {loading ? '...' : formatNumber(monthIn)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm font-medium text-gray-500">إجمالي المنصرف (هذا الشهر)</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-2 break-words">
            {loading ? '...' : formatNumber(monthOut)}
          </div>
        </div>
      </div>

      {/* حركة الخزينة */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#12829b]" />
            تقرير حركة الخزينة
          </h3>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <input
              type="text"
              value={textFilter}
              onChange={e => { setTextFilter(e.target.value); setCurrentPage(1); }}
              placeholder="بحث بالتصنيف أو البيان..."
              className="flex-1 sm:w-56 bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12829b]"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 sm:w-auto bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12829b]"
            />
            {(dateFilter || textFilter) && (
              <button
                onClick={() => { setDateFilter(''); setTextFilter(''); setCurrentPage(1); }}
                className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium shrink-0"
              >
                إلغاء الفلتر
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap min-w-[600px]" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">التصنيف</th>
                <th className="px-4 py-3 text-xs">البيان</th>
                <th className="px-4 py-3 text-xs">الوارد</th>
                <th className="px-4 py-3 text-xs">المنصرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    لا توجد حركات مسجلة
                  </td>
                </tr>
              ) : pagedTransactions.map((trx, i) => (
                <motion.tr 
                  key={trx.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{trx.dateString}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trx.type === 'IN' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {trx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-normal min-w-[200px]">{trx.description}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600" dir="ltr">
                    {trx.type === 'IN' ? `+${formatNumber(trx.amount)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600" dir="ltr">
                    {trx.type === 'OUT' ? `-${formatNumber(trx.amount)}` : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            <p>
              عرض {formatNumber(pageStart + 1)}-{formatNumber(Math.min(pageStart + PAGE_SIZE, filteredTransactions.length))} من {formatNumber(filteredTransactions.length)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
                disabled={effectivePage <= 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-2 text-gray-600">صفحة {formatNumber(effectivePage)} من {formatNumber(totalPages)}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, effectivePage + 1))}
                disabled={effectivePage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Opening Balance Modal */}
      {showOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">الرصيد الافتتاحي للخزينة</h3>
              <button onClick={() => setShowOpeningModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                <input 
                  type="number"
                  value={newOpeningBalance}
                  onChange={e => setNewOpeningBalance(e.target.value)}
                  className="input-field"
                  placeholder={`الرصيد الحالي المسجل: ${formatNumber(openingBalanceVal)}`}
                />
              </div>
              <button 
                onClick={handleSetOpeningBalance}
                disabled={saving || !newOpeningBalance}
                className="btn-primary w-full"
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
