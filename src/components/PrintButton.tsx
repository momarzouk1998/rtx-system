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

  // دالة لإصلاح الألوان المتقدمة التي لا تدعمها المكتبات
  const sanitizeStyles = (element: HTMLElement) => {
    // استخراج كل الـ styles المحسوبة وتطبيقها inline
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      
      // تطبيق الألوان الأساسية فقط بدون lab/oklch
      const color = computed.color;
      const bgColor = computed.backgroundColor;
      const borderColor = computed.borderColor;
      
      // استبدال أي قيم lab/oklch/color-mix بألوان ثابتة
      if (color && !color.startsWith('rgb')) {
        htmlEl.style.color = '#0f172a';
      } else if (color) {
        htmlEl.style.color = color;
      }
      
      if (bgColor && !bgColor.startsWith('rgb')) {
        htmlEl.style.backgroundColor = '#ffffff';
      } else if (bgColor) {
        htmlEl.style.backgroundColor = bgColor;
      }
      
      if (borderColor && !borderColor.startsWith('rgb')) {
        htmlEl.style.borderColor = '#e2e8f0';
      } else if (borderColor) {
        htmlEl.style.borderColor = borderColor;
      }
    });
    
    // إزالة كل CSS stylesheets وتطبيق inline styles فقط
    element.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      el.remove();
    });
  };

  // طريقة بديلة محسّنة تتجنب مشاكل الألوان
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

      // نسخ العنصر
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // إخفاء العناصر غير المطلوبة
      clonedElement.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // إضافة للـ body مؤقتاً
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-99999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);
      
      // إصلاح الألوان
      sanitizeStyles(clonedElement);
      
      await new Promise((r) => setTimeout(r, 500));

      // استخدام html2canvas مباشرة بدلاً من html2pdf
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      
      const canvas = await html2canvas(clonedElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        foreignObjectRendering: false,
        imageTimeout: 15000
      });

      // إنشاء PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.90);
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
      const renderWidth = pdfWidth - 16; // margins
      const renderHeight = (imgHeight * renderWidth) / imgWidth;

      let position = 8;
      if (renderHeight <= pdfHeight - 16) {
        pdf.addImage(imgData, "JPEG", 8, position, renderWidth, renderHeight);
      } else {
        let heightLeft = renderHeight;
        pdf.addImage(imgData, "JPEG", 8, position, renderWidth, renderHeight);
        heightLeft -= (pdfHeight - 16);

        while (heightLeft > 0) {
          position = heightLeft - renderHeight + 8;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 8, position, renderWidth, renderHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`${fileName}.pdf`);
      
      // تنظيف
      document.body.removeChild(clonedElement);
      
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

      const element = (
        document.getElementById(targetId) || 
        document.querySelector(".printable-statement-content") || 
        document.querySelector(".printable-content") || 
        document.body
      ) as HTMLElement;
      
      if (!element) {
        throw new Error("لم يتم العثور على العنصر المراد طباعته");
      }

      await new Promise((r) => setTimeout(r, 500));

      const html2canvasModule = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvasModule(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        foreignObjectRendering: false,
        onclone: (clonedDoc: Document) => {
          try {
            clonedDoc.querySelectorAll('.no-print').forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });

            const styleElements = clonedDoc.querySelectorAll('style');
            styleElements.forEach((s) => {
              if (s.textContent) {
                s.textContent = s.textContent
                  .replace(/lab\([^)]+\)/g, 'rgb(2, 132, 199)')
                  .replace(/oklch\([^)]+\)/g, 'rgb(2, 132, 199)')
                  .replace(/color-mix\([^)]+\)/g, 'rgb(2, 132, 199)');
              }
            });

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
        title="تحميل PDF (طريقة بديلة - موصى بها)"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 text-white" />
        )}
        {isGeneratingPdf ? "جاري..." : "بديل ⭐"}
      </button>
    </div>
  );
}
