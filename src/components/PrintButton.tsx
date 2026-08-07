"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function PrintButton({
  targetId = "statement",
  fileName = "كشف حساب",
  orientation = "portrait",
}: {
  targetId?: string;
  fileName?: string;
  orientation?: "portrait" | "landscape";
}) {
  const [loading, setLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const statementElement = (
        document.getElementById(targetId) ||
        document.getElementById("statement") ||
        document.querySelector(".printable-statement-content")
      ) as HTMLElement | null;

      if (!statementElement) {
        window.print();
        return;
      }

      // ── HTML2Canvas & jsPDF math from Rtx/statment ──────────────────────────
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(statementElement, {
        useCORS: true,
        scale: 1.8,
        logging: false,
        backgroundColor: "#ffffff",
        width: 800,
        height: statementElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        window.print();
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.90);
      const pdf = new jsPDF(orientation === "landscape" ? "l" : "p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      let imgWidth = pdfWidth - 12;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight - 12) {
        imgHeight = pdfHeight - 12;
        imgWidth = imgHeight * ratio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (error) {
      console.error("PDF generation failed:", error);
      window.print();
    } finally {
      setLoading(false);
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
        disabled={loading}
        className="bg-[#2298cd] hover:bg-[#1e7bb8] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
        title="تحميل كملف PDF"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-white" />
        )}
        {loading ? "جاري التحميل..." : "تحميل PDF"}
      </button>
    </div>
  );
}
