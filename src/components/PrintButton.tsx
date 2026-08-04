"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
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
        window.print();
        return;
      }

      // Briefly wait to ensure all elements and images are rendered
      await new Promise((r) => setTimeout(r, 200));

      const html2canvasModule = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Capture the element directly from live DOM to avoid iframe style loss
      const canvas = await html2canvasModule(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc: Document) => {
          // Hide no-print elements in capture
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          // Fix unsupported 'lab()' and 'oklch()' color functions from Tailwind v4
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((s) => {
            if (s.textContent && (s.textContent.includes('lab(') || s.textContent.includes('oklch('))) {
              s.textContent = s.textContent
                .replace(/lab\([^)]+\)/g, '#0284c7')
                .replace(/oklch\([^)]+\)/g, '#0284c7');
            }
          });
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
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
      toast.success("تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.warn("PDF generation error, falling back to window.print():", err);
      toast.error("حدث خطأ أثناء إعداد الـ PDF، جاري فتح الطباعة المباشرة");
      window.print();
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
