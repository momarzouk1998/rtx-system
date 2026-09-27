"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Printer, Package, User, Calendar, Tag, Phone, Download, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

// ألوان قياسية نقية بدون oklch
const C = {
  blue: "#0284c7",
  lightBlue: "#e0f2fe",
  darkBlue: "#0369a1",
  slateDark: "#0f172a",
  slateHeader: "#1e293b",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  white: "#ffffff",
  lightBg: "#f8fafc",
  amber: "#d97706",
  amberBg: "#fef3c7",
  emerald: "#059669",
  emeraldBg: "#d1fae5",
  rose: "#e11d48",
  roseBg: "#ffe4e6",
} as const;

// حقن CSS للطباعة
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
  discount?: number | null;
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

  const cleanupDomAfterPdf = () => {
    try {
      document.querySelectorAll('.html2pdf__container, .html2pdf__overlay, iframe[src="about:blank"]').forEach((el) => {
        el.remove();
      });
      document.body.style.pointerEvents = 'auto';
      document.body.style.userSelect = 'auto';
      document.body.classList.remove('html2pdf__generating');
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      cleanupDomAfterPdf();
    }
    return () => {
      document.body.style.overflow = '';
      cleanupDomAfterPdf();
    };
  }, [isOpen]);

  const formattedDate = invoice?.date ? new Date(invoice.date).toISOString().split("T")[0] : "";

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);

      const element =
        document.getElementById(`invoice-container-${invoice.id}`) ||
        (document.querySelector(".printable-invoice-content") as HTMLElement) ||
        document.body;

      if (!element) {
        toast.error("تعذر العثور على محتوى الفاتورة");
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          const tempCanvas = clonedDoc.createElement("canvas");
          const ctx = tempCanvas.getContext("2d");

          const convertOklchToRgb = (str: string): string => {
            if (!str || typeof str !== "string" || !str.includes("oklch")) return str;
            if (!ctx) return str.replace(/oklch\([^)]+\)/gi, "rgb(2, 132, 199)");
            return str.replace(/oklch\([^)]+\)/gi, (match) => {
              try {
                ctx.fillStyle = "#000000";
                ctx.fillStyle = match;
                return ctx.fillStyle;
              } catch {
                return "rgb(2, 132, 199)";
              }
            });
          };

          // 1. تنظيف وسوم style
          clonedDoc.querySelectorAll("style").forEach((s) => {
            if (s.textContent && s.textContent.includes("oklch")) {
              s.textContent = convertOklchToRgb(s.textContent);
            }
          });

          // 2. إخفاء no-print
          clonedDoc.querySelectorAll(".no-print").forEach((el) => {
            (el as HTMLElement).style.setProperty("display", "none", "important");
          });

          // 3. تحويل computed colors لألوان RGB صريحة
          const origAll = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];
          const clonedAll = [clonedElement, ...Array.from(clonedElement.querySelectorAll("*"))] as HTMLElement[];

          const COLOR_PROPS = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderBottomColor",
            "borderLeftColor",
            "borderRightColor",
            "outlineColor",
            "boxShadow",
          ];

          for (let i = 0; i < origAll.length; i++) {
            const orig = origAll[i];
            const clone = clonedAll[i];
            if (!orig || !clone) continue;

            if (clone.style) {
              for (let s = 0; s < clone.style.length; s++) {
                const prop = clone.style[s];
                const val = clone.style.getPropertyValue(prop);
                if (val && val.includes("oklch")) {
                  clone.style.setProperty(prop, convertOklchToRgb(val));
                }
              }
            }

            try {
              const computed = window.getComputedStyle(orig);
              for (const prop of COLOR_PROPS) {
                const val = (computed as any)[prop];
                if (val && typeof val === "string" && val.includes("oklch")) {
                  const rgbVal = convertOklchToRgb(val);
                  const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
                  clone.style.setProperty(cssProp, rgbVal, "important");
                }
              }
            } catch {}
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        toast.error("حدث خطأ أثناء إنشاء ملف PDF");
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= printableHeight) {
        const x = (pdfWidth - imgWidth) / 2;
        const y = margin;
        pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      } else {
        const pageCanvasHeight = (canvas.width * printableHeight) / printableWidth;
        let positionY = 0;
        let pageCount = 0;

        while (positionY < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - positionY);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;

          const ctx = pageCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(canvas, 0, positionY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          }

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);
          const pageImgHeight = (sliceHeight * printableWidth) / canvas.width;

          if (pageCount > 0) pdf.addPage();
          pdf.addImage(pageImgData, "JPEG", margin, margin, printableWidth, pageImgHeight);

          positionY += sliceHeight;
          pageCount++;
        }
      }

      const customerName = invoice.client?.name || "عميل";
      const invoiceNumber = invoice.orderNumber || "0";
      pdf.save(`فاتورة_RTX_${customerName}_${invoiceNumber}.pdf`);
      toast.success("تم تحميل ملف PDF بنجاح");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("فشل إنشاء ملف PDF، جاري فتح الطباعة");
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      cleanupDomAfterPdf();
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <span style={{ backgroundColor: C.amberBg, color: C.amber, border: `1px solid ${C.amber}`, padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>قيد التشغيل</span>;
      case "ORDERED":
        return <span style={{ backgroundColor: C.lightBlue, color: C.blue, border: `1px solid ${C.blue}`, padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>تم الطلب</span>;
      case "SHIPPED":
        return <span style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", border: "1px solid #7e22ce", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>تم الشحن</span>;
      case "DELIVERED":
        return <span style={{ backgroundColor: C.emeraldBg, color: C.emerald, border: `1px solid ${C.emerald}`, padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>تم التسليم</span>;
      default:
        return <span style={{ backgroundColor: C.roseBg, color: C.rose, border: `1px solid ${C.rose}`, padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "bold" }}>ملغي</span>;
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
                فاتورة مبيعات <span style={{ color: "#38bdf8" }}>#{invoice.orderNumber}</span>
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
        <div
          id={`invoice-container-${invoice.id}`}
          className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible printable-invoice-content"
          style={{ backgroundColor: C.white, color: C.text, direction: "rtl", textAlign: "right", fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
        >
          {/* Cyan Top Line */}
          <div style={{ height: "4px", width: "100%", background: `linear-gradient(90deg, ${C.blue} 0%, #38bdf8 50%, ${C.slateDark} 100%)`, borderRadius: "4px", marginBottom: "8px" }} />

          {/* Official Header matching Invoice.html */}
          <div style={{ borderBottom: `2px solid ${C.slateDark}`, paddingBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Logo & Company Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ backgroundColor: C.slateDark, padding: "8px", borderRadius: "12px", border: `2px solid #38bdf8`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="/rtx-logo.png" alt="RTX Logo" style={{ height: "45px", width: "auto", objectFit: "contain" }} />
                </div>
                <div>
                  <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: C.slateDark, margin: 0 }}>
                    RTX للتجارة والتصنيع
                  </h1>
                </div>
              </div>

              {/* Document Badge */}
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "inline-block", background: `linear-gradient(90deg, ${C.slateDark} 0%, ${C.blue} 100%)`, color: C.white, padding: "5px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 800 }}>
                  فاتورة مبيعات
                </div>
                <div style={{ marginTop: "6px", fontSize: "0.75rem", fontWeight: "bold", color: C.muted }}>
                  <div>رقم الفاتورة: <strong style={{ color: C.blue, fontSize: "0.85rem" }}>#{invoice.orderNumber}</strong></div>
                  <div>التاريخ: <strong>{formattedDate}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "0.75rem 1rem", backgroundColor: C.lightBg, borderRadius: "10px", border: `1px solid ${C.border}`, fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: C.muted, fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                <User className="w-3.5 h-3.5" style={{ color: C.blue }} /> اسم العميل المحترم:
              </span>
              <p style={{ fontWeight: 900, color: C.slateDark, fontSize: "1rem", margin: "2px 0 0 0" }}>
                {invoice.client?.name || "عميل غير محدد"}
              </p>
              {invoice.client?.phone && (
                <p style={{ fontSize: "0.75rem", color: C.muted, display: "flex", alignItems: "center", gap: "4px", margin: "2px 0 0 0", fontWeight: 600 }}>
                  <Phone className="w-3 h-3" style={{ color: C.blue }} /> {invoice.client.phone}
                </p>
              )}
            </div>

            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
              <span style={{ color: C.muted, fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag className="w-3.5 h-3.5" style={{ color: C.blue }} /> حالة الفاتورة:
              </span>
              <div style={{ marginTop: "4px" }}>
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderRadius: "10px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ backgroundColor: C.slateDark, color: C.white, padding: "8px 12px", fontWeight: "bold", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Package className="w-3.5 h-3.5" style={{ color: "#38bdf8" }} />
              الأصناف والمنتجات المطلوبة
            </div>
            <table style={{ width: "100%", textAlign: "right", fontSize: "0.82rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", color: C.text, fontSize: "0.75rem", fontWeight: 900, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: "8px 12px", width: "40px", textAlign: "center" }}>#</th>
                  <th style={{ padding: "8px 12px" }}>اسم الصنف</th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>الكمية (أكياس)</th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>سعر الكيس</th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>الإجمالي (ج.م)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, idx: number) => {
                    const qty = item.quantity || item.quantityBags || 0;
                    const price = item.bagPrice || item.pricePerUnit || 0;
                    const total = item.totalPrice || qty * price;
                    return (
                      <tr key={item.id || idx} style={{ borderBottom: `1px solid #f1f5f9`, backgroundColor: idx % 2 === 0 ? C.white : C.lightBg }}>
                        <td style={{ padding: "8px 12px", color: C.muted, fontWeight: "bold", fontSize: "0.75rem", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px 12px", fontWeight: 800, color: C.slateDark }}>
                          {item.product?.name || "صنف غير معروف"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", backgroundColor: C.lightBlue }}>
                          <span style={{ color: C.blue, fontWeight: 900, fontSize: "0.9rem" }}>
                            {formatNumber(qty)}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", backgroundColor: C.amberBg }}>
                          <span style={{ color: C.amber, fontWeight: 900, fontSize: "0.9rem" }}>
                            {formatNumber(price)}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "left", fontWeight: 900, color: C.slateDark, fontSize: "0.9rem" }}>
                          {formatNumber(total)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: C.muted }}>
                      لا توجد أصناف في هذه الفاتورة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Calculation Breakdown */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "280px" }}>
              {discountAmount > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", textAlign: "center" }}>
                  <div style={{ backgroundColor: C.lightBg, padding: "8px 4px", borderRadius: "8px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "0.68rem", color: C.muted, fontWeight: "bold", marginBottom: "2px" }}>قبل الخصم</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.slateDark }}>
                      {formatNumber(invoice.subTotal || 0)}
                    </div>
                  </div>
                  
                  <div style={{ backgroundColor: C.amberBg, padding: "8px 4px", borderRadius: "8px", border: `1px solid ${C.amber}` }}>
                    <div style={{ fontSize: "0.68rem", color: C.amber, fontWeight: "bold", marginBottom: "2px" }}>الخصم</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.amber }}>
                      {formatNumber(discountAmount)}
                    </div>
                  </div>
                  
                  <div style={{ backgroundColor: C.emeraldBg, padding: "8px 4px", borderRadius: "8px", border: `1px solid ${C.emerald}` }}>
                    <div style={{ fontSize: "0.68rem", color: C.emerald, fontWeight: "bold", marginBottom: "2px" }}>الصافي</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 900, color: C.emerald }}>
                      {formatNumber(invoice.netTotal || 0)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.darkBlue} 100%)`, color: C.white, padding: "12px 16px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 900, fontSize: "0.95rem" }}>صافي الفاتورة:</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>
                    {formatNumber(invoice.netTotal || 0)} ج.م
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ backgroundColor: C.amberBg, border: `1px solid ${C.amber}`, padding: "10px", borderRadius: "8px", fontSize: "0.75rem", color: C.text }}>
              <strong style={{ display: "block", marginBottom: "2px" }}>ملاحظات الفاتورة:</strong>
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