"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ينظّف CSS من أي دوال ألوان غير مدعومة من html2canvas:
 *   oklch(...) / lab(...) / color-mix(...)
 * يتعامل مع قوسين متداخلين من مستوى واحد (كافي لـ Tailwind v4)
 */
function cleanCSS(css: string): string {
  // Pattern: اسم_الدالة( ... ) مع دعم قوس داخلي واحد
  const pattern = /(oklch|lab|color-mix)\((?:[^()]*|\([^()]*\))*\)/g;
  return css.replace(pattern, (_, fn: string) => {
    if (fn === "lab") return "#0f172a";       // Tailwind slate-950
    if (fn === "oklch") return "#0ea5e9";     // Tailwind sky-500
    return "#0284c7";                          // color-mix → sky-600
  });
}

export function PrintButton({
  targetId = "printable-area",
  fileName = "RTX-Document",
  orientation = "portrait",
}: {
  targetId?: string;
  fileName?: string;
  orientation?: "portrait" | "landscape";
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const element = (
        document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content")
      ) as HTMLElement | null;

      if (!element) throw new Error("لم يتم العثور على العنصر المراد طباعته");

      // ═══════════════════════════════════════════════════════════════
      // الخطوة 1: نجلب كل ملفات CSS الخارجية ونستبدل lab/oklch فيها
      // قبل أن يلمسها html2canvas — هذا هو الحل الجذري الحقيقي
      // ═══════════════════════════════════════════════════════════════
      const cssCache = new Map<string, string>();
      const linkEls = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      );

      await Promise.all(
        linkEls.map(async (link) => {
          try {
            const res = await fetch(link.href);
            const raw = await res.text();
            cssCache.set(link.href, cleanCSS(raw));
          } catch {
            cssCache.set(link.href, ""); // فشل الجلب → سنحذف الرابط
          }
        })
      );

      // ═══════════════════════════════════════════════════════════════
      // الخطوة 2: html2canvas مع onclone لتبديل الروابط بالـ CSS النظيف
      // ═══════════════════════════════════════════════════════════════
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc: Document) => {
          try {
            // إخفاء عناصر no-print
            clonedDoc.querySelectorAll(".no-print").forEach((el) => {
              (el as HTMLElement).style.setProperty("display", "none", "important");
            });

            // إصلاح مسارات الصور النسبية
            clonedDoc.querySelectorAll("img").forEach((img) => {
              const src = (img as HTMLImageElement).getAttribute("src");
              if (src?.startsWith("/")) {
                (img as HTMLImageElement).src = window.location.origin + src;
              }
            });

            // استبدال روابط CSS الخارجية بالنسخ المنظّفة
            clonedDoc
              .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
              .forEach((link) => {
                const cleaned = cssCache.get(link.href);
                if (cleaned) {
                  const style = clonedDoc.createElement("style");
                  style.textContent = cleaned;
                  link.parentNode?.insertBefore(style, link);
                }
                link.remove(); // نزيل الرابط الأصلي دائماً
              });

            // تنظيف أي <style> مباشرة في الصفحة
            clonedDoc.querySelectorAll("style").forEach((s) => {
              if (s.textContent) {
                s.textContent = cleanCSS(s.textContent);
              }
            });
          } catch (cloneErr) {
            console.warn("onclone warning:", cloneErr);
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("فشل في تحويل الصفحة إلى صورة");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (!imgData || imgData === "data:,") {
        throw new Error("فشل في توليد صورة المحتوى");
      }

      // ═══════════════════════════════════════════════════════════════
      // الخطوة 3: إنشاء PDF بصفحات A4 متعددة إذا لزم
      // ═══════════════════════════════════════════════════════════════
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;
      const imgH = (canvas.height * contentW) / canvas.width;

      let heightLeft = imgH;
      let pageNum = 0;

      while (heightLeft > 0) {
        if (pageNum > 0) pdf.addPage();
        const posY = margin - pageNum * contentH;
        pdf.addImage(imgData, "JPEG", margin, posY, contentW, imgH);
        heightLeft -= contentH;
        pageNum++;
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ خطأ PDF:", err);
      toast.error(`خطأ في الـ PDF: ${msg.slice(0, 100)}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-2 no-print">
      <button
        onClick={() => window.print()}
        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        title="طباعة مباشرة"
      >
        <Printer className="w-4 h-4 text-[#38bdf8]" />
        طباعة
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
        title="تحميل كملف PDF"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-white" />
        )}
        {isGeneratingPdf ? "جاري التحميل..." : "تحميل PDF"}
      </button>
    </div>
  );
}
