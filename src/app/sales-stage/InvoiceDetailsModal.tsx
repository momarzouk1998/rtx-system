"use client";

import { useState } from "react";
import { Eye, X, Printer, Package, User, Calendar, DollarSign, Tag } from "lucide-react";

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

  const formattedDate = invoice?.date ? new Date(invoice.date).toISOString().split("T")[0] : "";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">قيد التشغيل</span>;
      case "ORDERED":
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">تم الطلب</span>;
      case "SHIPPED":
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold">تم الشحن</span>;
      case "DELIVERED":
        return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">تم التسليم</span>;
      default:
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">ملغي</span>;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[#12829b] hover:text-[#0ea5e9] hover:bg-blue-100 bg-blue-50 px-2.5 py-1 rounded-md transition-colors text-xs font-medium"
      >
        <Eye className="w-3.5 h-3.5" />
        عرض التفاصيل
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#12829b]/10 text-[#12829b] flex items-center justify-center font-bold text-lg">
                  #{invoice.orderNumber}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    تفاصيل الفاتورة #{invoice.orderNumber}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-sm">
                <div>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <User className="w-3 h-3" /> العميل
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {invoice.client?.name || "غير محدد"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Tag className="w-3 h-3" /> حالة الفاتورة
                  </span>
                  <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                </div>

                <div>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> إجمالي الصافي
                  </span>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 text-base">
                    {(invoice.netTotal || 0).toLocaleString()} ج.م
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#12829b]" /> الأصناف المسجلة ({invoice.items?.length || 0})
                </h4>
                <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-right text-sm" dir="rtl">
                    <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs">
                      <tr>
                        <th className="px-4 py-2.5">اسم المنتج</th>
                        <th className="px-4 py-2.5 text-center">الكمية (أكياس)</th>
                        <th className="px-4 py-2.5 text-center">سعر الوحدة</th>
                        <th className="px-4 py-2.5 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item: any) => {
                          const qty = item.quantity || item.quantityBags || 0;
                          const price = item.bagPrice || item.pricePerUnit || 0;
                          const total = item.totalPrice || qty * price;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                {item.product?.name || "صنف غير معروف"}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300 font-semibold">
                                {qty.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                                {price.toLocaleString()} ج.م
                              </td>
                              <td className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                                {total.toLocaleString()} ج.م
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                            لا توجد أصناف في هذه الفاتورة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation breakdown */}
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-2 text-sm border border-gray-100 dark:border-zinc-800">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>الإجمالي الإجمالي (قبل الخصم):</span>
                  <span className="font-semibold">{(invoice.subTotal || 0).toLocaleString()} ج.م</span>
                </div>
                {((invoice.discountValue || invoice.discount || 0) > 0) && (
                  <div className="flex justify-between text-red-500">
                    <span>الخصم المطبق:</span>
                    <span className="font-semibold">- {(invoice.discountValue || invoice.discount || 0).toLocaleString()} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-zinc-700">
                  <span>الصافي النهائي:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{(invoice.netTotal || 0).toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Notes if any */}
              {invoice.notes && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold block mb-1">ملاحظات:</span>
                  {invoice.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-zinc-800/80 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#12829b] hover:bg-[#0ea5e9] text-white text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
