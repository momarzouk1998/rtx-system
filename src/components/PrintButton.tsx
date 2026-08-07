"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

    try {
      setIsGeneratingPdf(true);

      const element = (
        document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content")
      ) as HTMLElement | null;

      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد طباعته");
      }

      // ============================================================
      // الحل الجذري: نستخدم html2pdf.js الذي يتعامل مع lab/oklch
      // بشكل أكثر مرونة، مع تنظيف الستايل في onclone
      // ============================================================
      const html2pdf = (await import("html2pdf.js")).default;

      const customerFileName = fileName;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `${customerFileName}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc: Document) => {
              // إخفاء عناصر no-print
              clonedDoc.querySelectorAll(".no-print").forEach((el) => {
                (el as HTMLElement).style.setProperty("display", "none", "important");
              });

              // إصلاح الصور النسبية
              clonedDoc.querySelectorAll("img").forEach((img: HTMLImageElement) => {
                if (img.getAttribute("src")?.startsWith("/")) {
                  img.src = window.location.origin + img.getAttribute("src")!;
                }
              });

              // ✅ استبدال lab/oklch/color-mix في كل <style> tags
              // بالطريقة الأكثر شمولاً والأبسط
              clonedDoc.querySelectorAll("style").forEach((styleEl) => {
                if (!styleEl.textContent) return;
                let css = styleEl.textContent;

                // نكرر حتى لا يبقى أي oklch/lab/color-mix (للأقواس المتداخلة)
                for (let i = 0; i < 5; i++) {
                  const before = css;
                  css = css
                    .replace(/oklch\([^()]*\)/g, "#0284c7")
                    .replace(/lab\([^()]*\)/g, "#0f172a")
                    .replace(/color-mix\([^()]*\)/g, "#0284c7");
                  if (css === before) break;
                }

                styleEl.textContent = css;
              });
            },
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: orientation,
          },
        })
        .from(element)
        .save();

      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ خطأ PDF:", msg, err);
      toast.error(`خطأ: ${msg.slice(0, 80)}`);
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
