"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * دالة لاستبدال جميع دالّات الألوان الحديثة (lab / oklch / color-mix)
 * التي لا يدعمها html2canvas بألوان rgb بديلة آمنة.
 * تستخدم do-while للتعامل مع أي أقواس متداخلة بأمان كامل.
 */
function replaceUnsupportedColors(text: string): string {
  if (!text) return text;
  let prev = "";
  let result = text;
  let iterations = 0;

  do {
    prev = result;
    result = result
      .replace(/lab\([^()]*\)/gi, "rgb(15, 23, 42)")
      .replace(/oklch\([^()]*\)/gi, "rgb(2, 132, 199)")
      .replace(/color-mix\([^()]*\)/gi, "rgb(2, 132, 199)");
    iterations++;
  } while (result !== prev && iterations < 10);

  return result;
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

    try {
      setIsGeneratingPdf(true);

      const element = (document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content") ||
        document.body) as HTMLElement;

      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد طباعته");
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2, // دقة عالية جداً ووضوح للنصوص
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc: Document) => {
          try {
            // 1. إخفاء كافة العناصر المستثناة من الطباعة
            clonedDoc.querySelectorAll(".no-print").forEach((el) => {
              (el as HTMLElement).style.setProperty("display", "none", "important");
            });

            // 2. إصلاح مسارات الصور النسبية
            clonedDoc.querySelectorAll("img").forEach((img) => {
              if (img.src && img.src.startsWith("/")) {
                img.src = window.location.origin + img.src;
              }
            });

            // 3. استبدال lab/oklch في كافة ملفات الـ CSS والستايل المستنسخ
            clonedDoc.querySelectorAll("style").forEach((styleEl) => {
              if (styleEl.textContent) {
                styleEl.textContent = replaceUnsupportedColors(styleEl.textContent);
              }
            });

            // 4. فحص الألوان المباشرة والمحسوبة على كل عنصر لضمان عدم وجود lab/oklch
            const allNodes = clonedDoc.querySelectorAll("*");
            allNodes.forEach((node) => {
              const htmlEl = node as HTMLElement;

              // الستايل المباشر
              const styleAttr = htmlEl.getAttribute("style");
              if (
                styleAttr &&
                (styleAttr.includes("lab") ||
                  styleAttr.includes("oklch") ||
                  styleAttr.includes("color-mix"))
              ) {
                htmlEl.setAttribute("style", replaceUnsupportedColors(styleAttr));
              }

              // الستايل المحسوب من Tailwind v4
              try {
                const cs = clonedDoc.defaultView?.getComputedStyle(htmlEl);
                if (cs) {
                  const props = ["color", "backgroundColor", "borderColor", "outlineColor"];
                  props.forEach((p) => {
                    const val = cs.getPropertyValue(p);
                    if (
                      val &&
                      (val.includes("lab") ||
                        val.includes("oklch") ||
                        val.includes("color-mix"))
                    ) {
                      htmlEl.style.setProperty(p, replaceUnsupportedColors(val));
                    }
                  });
                }
              } catch {
                // ignore computed style read errors
              }
            });
          } catch (cloneErr) {
            console.warn("تننيبيه أثناء تجهيز المستند للطباعة:", cloneErr);
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("فشل في تحويل الصفحة إلى صورة");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      if (!imgData || imgData === "data:,") {
        throw new Error("فشل في توليد صورة المحتوى");
      }

      // إنشاء مستند PDF بقياس A4
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 8;
      const marginY = 8;
      const printableWidth = pageWidth - marginX * 2;
      const printableHeight = pageHeight - marginY * 2;

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let pageIndex = 0;

      while (heightLeft > 0) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // إزاحة الصورة رأساً على عقب بمقدار ارتفاع كل صفحة
        const positionY = marginY - pageIndex * printableHeight;
        pdf.addImage(imgData, "JPEG", marginX, positionY, imgWidth, imgHeight);

        heightLeft -= printableHeight;
        pageIndex++;
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.error("خطأ أثناء إنشاء الـ PDF:", err);
      toast.error("حدث خطأ في التصدير، جاري استخدام الطباعة المباشرة...");
      setTimeout(() => window.print(), 300);
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
