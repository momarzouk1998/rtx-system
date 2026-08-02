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

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      
      // Let UI update loader state
      await new Promise((r) => setTimeout(r, 60));

      const element = document.getElementById(targetId) || document.querySelector(".printable-statement-content") || document.querySelector(".printable-content");
      
      if (!element) {
        window.print();
        return;
      }

      const html2pdfModule = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 5,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.92 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff',
          removeContainer: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: orientation,
          compress: true
        }
      };

      const pdfPromise = html2pdfModule().set(opt).from(element).save();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("PDF generation timeout")), 8000)
      );

      await Promise.race([pdfPromise, timeoutPromise]);
    } catch (err) {
      console.warn("PDF generation warning, offering fallback:", err);
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
