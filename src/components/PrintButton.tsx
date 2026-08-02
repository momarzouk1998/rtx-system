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
      await new Promise((r) => setTimeout(r, 50));

      const element = document.getElementById(targetId) || document.querySelector(".printable-content") || document.body;
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
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: orientation,
          compress: true
        }
      };

      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-2 no-print">
      <button
        onClick={() => window.print()}
        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Printer className="w-4 h-4 text-[#38bdf8]" />
        طباعة
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-white" />
        )}
        تحميل PDF
      </button>
    </div>
  );
}
