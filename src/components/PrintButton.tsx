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
  const [loading, setLoading] = useState(false);

  const handleNativePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const element = (
        document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content")
      ) as HTMLElement | null;

      if (!element) {
        window.print();
        return;
      }

      // ── HTML2Canvas capture of live visible element ────────────────────────
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
          clonedDoc.querySelectorAll(".no-print").forEach((el) =>
            (el as HTMLElement).style.setProperty("display", "none", "important")
          );
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        window.print();
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4", compress: true });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const mx = 6;
      const my = 6;
      const cw = pw - mx * 2;
      const ch = ph - my * 2;
      const imgH = (canvas.height * cw) / canvas.width;

      let left = imgH;
      let page = 0;
      while (left > 0) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", mx, my - page * ch, cw, imgH);
        left -= ch;
        page++;
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.warn("PDF Fallback to print:", err);
      window.print();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 no-print">
      <button
        onClick={handleNativePrint}
        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        title="طباعة مباشرة أو حفظ كـ PDF عالي الجودة"
      >
        <Printer className="w-4 h-4 text-[#38bdf8]" />
        طباعة (Vector PDF)
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={loading}
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
        title="تحميل كملف PDF مباشر"
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
