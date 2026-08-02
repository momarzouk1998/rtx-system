"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Printer, Package, User, Calendar, Tag, Phone } from "lucide-react";

interface InvoiceItem {
  id: string;
  productId?: string;
  product?: {
    name: string;
  } | null;
  quantity?: number | null;
  bagPrice?: number | null;
  totalPrice?: number | null;
}

interface Invoice {
  id: string;
  orderNumber: number;
  date: Date | string;
  status: string;
  subTotal: number;
  discountValue?: number | null;
  netTotal: number;
  notes?: string | null;
  client?: {
    name: string;
    phone?: string | null;
  } | null;
  items?: InvoiceItem[];
}

export function InvoiceDetailsModal({ invoice }: { invoice: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = invoice?.date ? new Date(invoice.date).toISOString().split("T")[0] : "";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">قيد التشغيل</span>;
      case "ORDERED":
        return <span className="bg-sky-100 text-sky-800 border border-sky-300 px-3 py-1 rounded-full text-xs font-bold">تم الطلب</span>;
      case "SHIPPED":
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold">تم الشحن</span>;
      case "DELIVERED":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">تم التسليم</span>;
      default:
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-full text-xs font-bold">ملغي</span>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PROCESSING": return "قيد التشغيل";
      case "ORDERED": return "تم الطلب";
      case "SHIPPED": return "تم الشحن";
      case "DELIVERED": return "تم التسليم";
      default: return "ملغي";
    }
  };

  const discountAmount = invoice.discountValue || invoice.discount || 0;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 modal-print-container animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-zinc-800 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Header (Screen mode) */}
        <div className="px-6 py-4 bg-slate-900 border-b border-sky-500/30 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-slate-950 rounded-xl border border-sky-400/40 shadow-xs flex items-center justify-center">
              <img src="/rtx-logo.png" alt="RTX Logo" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                فاتورة مبيعات <span className="text-[#38bdf8]">#{invoice.orderNumber}</span>
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-[#38bdf8]" /> {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Corporate Invoice Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
          
          {/* Cyan Top Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-slate-900 rounded-full mb-2 print:rounded-none"></div>

          {/* Official Header matching Invoice.html */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex justify-between items-start">
              
              {/* Logo & Company Name */}
              <div className="flex items-center gap-4">
                <div className="bg-slate-950 p-2.5 rounded-2xl border-2 border-sky-400/40 shadow-md flex items-center justify-center print:border-slate-800">
                  <img src="/rtx-logo.png" alt="RTX Logo" className="h-14 w-auto object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    RTX للتجارة والتصنيع
                  </h1>
                </div>
              </div>

              {/* Document Badge */}
              <div className="text-left">
                <div className="inline-block bg-gradient-to-r from-slate-900 to-[#0284c7] text-white px-5 py-2 rounded-xl text-sm font-black shadow-xs print:bg-slate-900 print:text-white print:border print:border-black">
                  فاتورة مبيعات
                </div>
                <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1 text-left">
                  <p>رقم الفاتورة: <span className="text-[#0284c7] dark:text-[#38bdf8] font-black text-sm">#{invoice.orderNumber}</span></p>
                  <p>التاريخ: <span className="text-slate-900 dark:text-white">{formattedDate}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info Bar */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50/50 dark:bg-zinc-800/50 rounded-xl border border-sky-200/80 dark:border-zinc-700 text-sm print:bg-slate-50 print:border-slate-300">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0ea5e9]" /> اسم العميل المكرم:
              </span>
              <p className="font-black text-slate-900 dark:text-white text-base">
                {invoice.client?.name || "عميل غير محدد"}
              </p>
              {invoice.client?.phone && (
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#0ea5e9]" /> {invoice.client.phone}
                </p>
              )}
            </div>

            <div className="space-y-1 text-left flex flex-col justify-center items-end">
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0ea5e9]" /> حالة الفاتورة:
              </span>
              <div className="mt-1 no-print">
                {getStatusBadge(invoice.status)}
              </div>
              <div className="hidden print:block font-bold text-slate-900 text-sm">
                {getStatusText(invoice.status)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2 no-print">
              <Package className="w-4 h-4 text-[#0ea5e9]" /> الأصناف المسجلة ({invoice.items?.length || 0})
            </h4>
            <div className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-xs print:rounded-none print:border-slate-400">
              <table className="w-full text-right text-sm" dir="rtl">
                <thead className="bg-slate-900 text-white text-xs print:bg-slate-200 print:text-black">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-800 print:border-slate-400 font-bold w-12 text-center">#</th>
                    <th className="px-4 py-3 border-b border-slate-800 print:border-slate-400 font-bold">اسم المنتج</th>
                    <th className="px-4 py-3 border-b border-slate-800 print:border-slate-400 text-center font-bold text-sky-300 print:text-black">الكمية (أكياس)</th>
                    <th className="px-4 py-3 border-b border-slate-800 print:border-slate-400 text-center font-bold text-amber-300 print:text-black">سعر الكيس</th>
                    <th className="px-4 py-3 border-b border-slate-800 print:border-slate-400 text-left font-bold text-[#38bdf8] print:text-black">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 print:divide-slate-300">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item: any, idx: number) => {
                      const qty = item.quantity || item.quantityBags || 0;
                      const price = item.bagPrice || item.pricePerUnit || 0;
                      const total = item.totalPrice || qty * price;
                      return (
                        <tr key={item.id || idx} className="hover:bg-sky-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-bold text-xs text-center">{idx + 1}</td>
                          <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                            {item.product?.name || "صنف غير معروف"}
                          </td>
                          {/* Distinct Soft Color Highlight for Quantity Column */}
                          <td className="px-4 py-3 text-center">
                            <span className="bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-300 font-extrabold px-3 py-1 rounded-lg border border-sky-200/80 dark:border-sky-800/40 print:bg-transparent print:border-none print:p-0 print:text-black">
                              {qty.toLocaleString("ar-EG")}
                            </span>
                          </td>
                          {/* Distinct Soft Color Highlight for Bag Price Column */}
                          <td className="px-4 py-3 text-center">
                            <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-extrabold px-3 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/40 print:bg-transparent print:border-none print:p-0 print:text-black">
                              {price.toLocaleString("ar-EG")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-left font-black text-[#0284c7] dark:text-[#38bdf8] print:text-black text-base">
                            {total.toLocaleString("ar-EG")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 font-medium">
                        لا توجد أصناف في هذه الفاتورة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Calculation Breakdown with Distinct Net Total Color Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-2 text-sm print:w-72">
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 print:border-slate-300">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                  <span>الإجمالي قبل الخصم:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{(invoice.subTotal || 0).toLocaleString("ar-EG")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>الخصم المطبق:</span>
                    <span className="font-extrabold">- {discountAmount.toLocaleString("ar-EG")}</span>
                  </div>
                )}
              </div>

              {/* Distinct Highlighted Net Total Color Box */}
              <div className="bg-gradient-to-r from-slate-900 via-[#0284c7] to-[#0369a1] text-white p-4 rounded-xl shadow-md flex justify-between items-center print:bg-slate-900 print:text-white print:border print:border-black">
                <span className="font-black text-base">الصافي النهائي:</span>
                <span className="text-2xl font-black text-white">{ (invoice.netTotal || 0).toLocaleString("ar-EG") }</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-300 print:bg-slate-50 print:border-slate-300 print:text-black">
              <span className="font-bold block mb-1">ملاحظات الفاتورة:</span>
              {invoice.notes}
            </div>
          )}

        </div>

        {/* Footer Actions (Screen mode) */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-[#0284c7] hover:from-slate-800 hover:to-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#38bdf8]" /> طباعة الفاتورة
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-[#0ea5e9] hover:text-[#0284c7] hover:bg-sky-100/80 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 px-3 py-1.5 rounded-lg transition-all text-xs font-bold shadow-xs cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5" />
        عرض الفاتورة
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
