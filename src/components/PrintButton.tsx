"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";

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

  const cleanupDomAfterPdf = () => {
    try {
      // إزالة كل العناصر المؤقتة اللي html2pdf بيضيفها
      document.querySelectorAll('.html2pdf__container, .html2pdf__overlay, iframe[src="about:blank"]').forEach((el) => {
        el.remove();
      });
      
      // إلغاء أي تأثيرات على الـ body
      document.body.style.pointerEvents = 'auto';
      document.body.style.userSelect = 'auto';
      document.body.style.overflow = '';
      
      // إزالة أي classes مؤقتة
      document.body.classList.remove('html2pdf__generating');
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      
      // تأكد إن الـ DOM نضيف قبل ما نبدأ
      cleanupDomAfterPdf();
      
      // Let UI update loader state
      await new Promise((r) => setTimeout(r, 100));

      const element = document.getElementById(targetId) || document.querySelector(".printable-statement-content") || document.querySelector(".printable-content") || document.body;
      
      if (!element) {
        window.print();
        return;
      }

      const html2pdfModule = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 5,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.95 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            // Fix html2canvas unsupported 'lab()' and 'oklch()' colors from Tailwind v4
            const styleElements = clonedDoc.querySelectorAll('style');
            styleElements.forEach((s) => {
              if (s.textContent && (s.textContent.includes('lab(') || s.textContent.includes('oklch('))) {
                s.textContent = s.textContent
                  .replace(/lab\([^)]+\)/g, '#0284c7')
                  .replace(/oklch\([^)]+\)/g, '#0284c7');
              }
            });
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: orientation,
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdfModule().set(opt).from(element).save();
      
      // انتظر شوية قبل التنضيف عشان التحميل يخلص
      await new Promise((r) => setTimeout(r, 500));
      
    } catch (err) {
      console.warn("PDF generation error, falling back to window.print():", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      
      // تنضيف شامل بعد ما نخلص
      cleanupDomAfterPdf();
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
