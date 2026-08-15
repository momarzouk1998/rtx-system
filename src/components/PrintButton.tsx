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
        (targetId ? document.getElementById(targetId) : null) ||
        document.getElementById("statement") ||
        document.getElementById("printable-client-statement") ||
        document.querySelector(".printable-statement-content")
      ) as HTMLElement | null;

      if (!statementElement) {
        toast.error("تعذر العثور على محتوى كشف الحساب");
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(statementElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          const tempCanvas = clonedDoc.createElement("canvas");
          const ctx = tempCanvas.getContext("2d");

          const convertOklchToRgb = (str: string): string => {
            if (!str || typeof str !== "string" || !str.includes("oklch")) return str;
            if (!ctx) return str.replace(/oklch\([^)]+\)/gi, "rgb(2, 132, 199)");
            return str.replace(/oklch\([^)]+\)/gi, (match) => {
              try {
                ctx.fillStyle = "#000000";
                ctx.fillStyle = match;
                return ctx.fillStyle;
              } catch {
                return "rgb(2, 132, 199)";
              }
            });
          };

          clonedDoc.querySelectorAll("style").forEach((s) => {
            if (s.textContent && s.textContent.includes("oklch")) {
              s.textContent = convertOklchToRgb(s.textContent);
            }
          });

          clonedDoc.querySelectorAll(".no-print").forEach((el) => {
            (el as HTMLElement).style.setProperty("display", "none", "important");
          });

          const origAll = [statementElement, ...Array.from(statementElement.querySelectorAll("*"))] as HTMLElement[];
          const clonedAll = [clonedElement, ...Array.from(clonedElement.querySelectorAll("*"))] as HTMLElement[];

          const COLOR_PROPS = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderBottomColor",
            "borderLeftColor",
            "borderRightColor",
            "outlineColor",
            "boxShadow",
          ];

          for (let i = 0; i < origAll.length; i++) {
            const orig = origAll[i];
            const clone = clonedAll[i];
            if (!orig || !clone) continue;

            if (clone.style) {
              for (let s = 0; s < clone.style.length; s++) {
                const prop = clone.style[s];
                const val = clone.style.getPropertyValue(prop);
                if (val && val.includes("oklch")) {
                  clone.style.setProperty(prop, convertOklchToRgb(val));
                }
              }
            }

            try {
              const computed = window.getComputedStyle(orig);
              for (const prop of COLOR_PROPS) {
                const val = (computed as any)[prop];
                if (val && typeof val === "string" && val.includes("oklch")) {
                  const rgbVal = convertOklchToRgb(val);
                  const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
                  clone.style.setProperty(cssProp, rgbVal, "important");
                }
              }
            } catch {}
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        toast.error("حدث خطأ أثناء إنشاء ملف PDF");
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF(orientation === "landscape" ? "l" : "p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= printableHeight) {
        const x = (pdfWidth - imgWidth) / 2;
        const y = margin;
        pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      } else {
        const pageCanvasHeight = (canvas.width * printableHeight) / printableWidth;
        let positionY = 0;
        let pageCount = 0;

        while (positionY < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - positionY);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;

          const ctx = pageCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(canvas, 0, positionY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          }

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);
          const pageImgHeight = (sliceHeight * printableWidth) / canvas.width;

          if (pageCount > 0) pdf.addPage();
          pdf.addImage(pageImgData, "JPEG", margin, margin, printableWidth, pageImgHeight);

          positionY += sliceHeight;
          pageCount++;
        }
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("تم تحميل ملف PDF بنجاح");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("فشل إنشاء ملف PDF، جاري فتح الطباعة");
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