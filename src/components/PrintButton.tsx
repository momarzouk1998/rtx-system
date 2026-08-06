"use client";

import { useState } from "react";
import { Printer, Download, Loader2, FileDown } from "lucide-react";
import toast from "react-hot-toast";

export function PrintButton({ 
  targetId = "printable-area", 
  fileName = "RTX-Document",
  orientation = "portrait"
}: { 
  targetId?: string; 
  fileName?: string; 
  orientation?: "portrait" | "landscape";
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // طريقة بديلة باستخدام html2pdf.js (أكثر استقراراً)
  const handleDownloadPdfAlternative = async () => {
    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      
      const element = (
        document.getElementById(targetId) || 
        document.querySelector(".printable-statement-content") || 
        document.querySelector(".printable-content")
      ) as HTMLElement;
      
      if (!element) {
        throw new Error("لم يتم العثور على العنصر");
      }

      await new Promise((r) => setTimeout(r, 300));

      // استخدام html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.85 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4', 
          orientation: orientation,
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.error("خطأ في الطريقة البديلة:", err);
      toast.error("حدث خطأ، جاري فتح الطباعة المباشرة");
      setTimeout(() => window.print(), 300);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      // Find the element to export
      const element = (
        document.getElementById(targetId) || 
        document.querySelector(".printable-statement-content") || 
        document.querySelector(".printable-content") || 
        document.body
      ) as HTMLElement;
      
      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد طباعته");
      }

      // انتظار أطول لضمان تحميل كل العناصر
      await new Promise((r) => setTimeout(r, 500));

      const html2canvasModule = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // محاولة التقاط الصفحة بإعدادات محسّنة
      const canvas = await html2canvasModule(element, {
        scale: 1.5, // تقليل الجودة قليلاً لتجنب مشاكل الذاكرة
        useCORS: true,
        allowTaint: true,
        logging: true, // تفعيل السجلات لمعرفة المشكلة
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        foreignObjectRendering: false, // تعطيل foreignObject الذي قد يسبب مشاكل
        onclone: (clonedDoc: Document) => {
          try {
            // إخفاء العناصر غير المطلوبة
            clonedDoc.querySelectorAll('.no-print').forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });

            // إصلاح ألوان Tailwind
            const styleElements = clonedDoc.querySelectorAll('style');
            styleElements.forEach((s) => {
              if (s.textContent) {
                s.textContent = s.textContent
                  .replace(/lab\([^)]+\)/g, '#0284c7')
                  .replace(/oklch\([^)]+\)/g, '#0284c7')
                  .replace(/color-mix\([^)]+\)/g, '#0284c7');
              }
            });

            // إصلاح الصور
            clonedDoc.querySelectorAll('img').forEach((img) => {
              if (img.src && img.src.startsWith('/')) {
                img.src = window.location.origin + img.src;
              }
            });
          } catch (cloneErr) {
            console.warn("خطأ في onclone:", cloneErr);
          }
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("فشل في إنشاء الصورة من المحتوى");
      }

      // تحويل Canvas إلى صورة بجودة معقولة
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      
      if (!imgData || imgData === "data:,") {
        throw new Error("فشل في تحويل المحتوى إلى صورة");
      }

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const renderWidth = pdfWidth;
      const renderHeight = (imgHeight * pdfWidth) / imgWidth;

      if (renderHeight <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, renderWidth, renderHeight);
      } else {
        let heightLeft = renderHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, renderWidth, renderHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - renderHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, renderWidth, renderHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.error("تفاصيل خطأ PDF:", err);
      const errorMsg = err instanceof Error ? err.message : "خطأ غير معروف";
      console.error("رسالة الخطأ:", errorMsg);
      toast.error("حدث خطأ أثناء إعداد الـ PDF، جاري فتح الطباعة المباشرة");
      
      // الانتظار قليلاً قبل فتح نافذة الطباعة
      setTimeout(() => {
        window.print();
      }, 300);
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
        title="تحميل كملف PDF (الطريقة الأساسية)"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-white" />
        )}
        {isGeneratingPdf ? "جاري التحميل..." : "تحميل PDF"}
      </button>

      <button
        onClick={handleDownloadPdfAlternative}
        disabled={isGeneratingPdf}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
        title="تحميل PDF (طريقة بديلة)"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 text-white" />
        )}
        {isGeneratingPdf ? "جاري..." : "بديل"}
      </button>
    </div>
  );
}
