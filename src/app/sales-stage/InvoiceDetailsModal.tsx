"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Printer, Package, User, Calendar, Tag, Phone, Download, Loader2 } from "lucide-react";

// إضافة CSS للطباعة
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .printable-invoice-content,
      .printable-invoice-content * {
        visibility: visible !important;
      }
      .printable-invoice-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
      @page {
        size: A4;
        margin: 15mm;
      }
    }
  `;
  if (!document.getElementById('invoice-print-styles')) {
    style.id = 'invoice-print-styles';
    document.head.appendChild(style);
  }
}

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // منع scroll لما المودال مفتوح وإلغاء المنع لما يقفل
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup عند unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formattedDate = invoice?.date ? new Date(invoice.date).toISOString().split("T")[0] : "";

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await new Promise((r) => setTimeout(r, 50));

      const element = document.getElementById(`invoice-container-${invoice.id}`) || document.querySelector(".printable-invoice-content");
      if (!element) {
        window.print();
        return;
      }
      
      const html2pdfModule = (await import("html2pdf.js")).default;
      const customerName = invoice.client?.name || "عميل";
      const invoiceNumber = invoice.orderNumber || "0";
      
      const opt = {
        margin: 5,
        filename: `فاتورة_RTX_${customerName}_${invoiceNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.95 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as const,
          compress: true
        }
      };

      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsGeneratingPdf(false);
      document.body.style.overflow = '';
    }
  };

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
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 modal-print-container animate-fade-in"
      onClick={(e) => {
        // لو الضغط على الـ overlay نفسه (مش على المودال)، قفل المودال
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-zinc-800 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        
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
        <div id={`invoice-container-${invoice.id}`} className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible printable-invoice-content bg-white">
          
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
                <thead className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white text-xs print:bg-[#0284c7]">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#0369a1] print:border-slate-400 font-bold w-12 text-center">#</th>
                    <th className="px-4 py-3 border-b border-[#0369a1] print:border-slate-400 font-bold">اسم المنتج</th>
                    <th className="px-4 py-3 border-b border-[#0369a1] print:border-slate-400 text-center font-bold bg-white/10">الكمية (أكياس)</th>
                    <th className="px-4 py-3 border-b border-[#0369a1] print:border-slate-400 text-center font-bold bg-white/10">سعر الكيس</th>
                    <th className="px-4 py-3 border-b border-[#0369a1] print:border-slate-400 text-left font-bold">الإجمالي</th>
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
                          {/* تمييز الكمية بلون مميز */}
                          <td className="px-4 py-3 text-center bg-blue-50/50 dark:bg-blue-950/20 print:bg-blue-50">
                            <span className="text-[#0284c7] dark:text-blue-400 font-black text-base px-2 py-1 print:text-[#0284c7]">
                              {qty.toLocaleString("ar-EG")}
                            </span>
                          </td>
                          {/* تمييز سعر الكيس بلون مميز */}
                          <td className="px-4 py-3 text-center bg-amber-50/50 dark:bg-amber-950/20 print:bg-amber-50">
                            <span className="text-amber-700 dark:text-amber-400 font-black text-base px-2 py-1 print:text-amber-700">
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
            <div className="w-full sm:w-80 space-y-3 text-sm print:w-72">
              {discountAmount > 0 ? (
                <>
                  {/* إذا فيه خصم - نعرض 3 صناديق */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* قبل الخصم */}
                    <div className="bg-slate-100 dark:bg-zinc-800 p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 text-center print:bg-slate-100 print:border-slate-400">
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-1">قبل الخصم</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white print:text-slate-900">
                        {(invoice.subTotal || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>
                    
                    {/* قيمة الخصم */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border-2 border-amber-300 dark:border-amber-800 text-center print:bg-amber-50 print:border-amber-400">
                      <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">الخصم</div>
                      <div className="text-lg font-black text-amber-700 dark:text-amber-300 print:text-amber-700">
                        {discountAmount.toLocaleString("ar-EG")}
                      </div>
                    </div>
                    
                    {/* صافي الفاتورة */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 p-3 rounded-xl border-2 border-emerald-600 dark:border-emerald-500 text-center shadow-lg print:bg-emerald-600 print:border-emerald-700">
                      <div className="text-xs text-white font-bold mb-1">صافي الفاتورة</div>
                      <div className="text-lg font-black text-white">
                        {(invoice.netTotal || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* إذا مفيش خصم - نعرض صندوق واحد كبير للصافي */}
                  <div className="bg-gradient-to-br from-[#0284c7] to-[#0369a1] dark:from-[#0369a1] dark:to-[#0284c7] text-white p-5 rounded-xl shadow-lg border-2 border-[#0369a1] print:bg-[#0284c7] print:border-[#0369a1]">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-lg">صافي الفاتورة:</span>
                      <span className="text-3xl font-black">
                        {(invoice.netTotal || 0).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#38bdf8]" /> طباعة
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-70"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              تحميل PDF
            </button>
          </div>
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
