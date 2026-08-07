"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * تحويل أي لون lab()/oklch()/color-mix() إلى hex/rgb بديل آمن.
 * html2canvas لا يدعم هذه الدوال اللونية الحديثة (Tailwind v4 يستخدمها).
 *
 * الطريقة: ننشئ عنصر مؤقت بالمتصفح ونسأله عن اللون المحسوب.
 * المتصفح يرجّعه كـ rgb() دائماً.
 */
function resolveColorToRgb(colorValue: string): string {
  if (
    !colorValue ||
    colorValue === "transparent" ||
    colorValue === "none" ||
    colorValue === "inherit" ||
    colorValue === "initial" ||
    colorValue.startsWith("rgb") ||
    colorValue.startsWith("#")
  ) {
    return colorValue;
  }

  try {
    const probe = document.createElement("div");
    probe.style.color = colorValue;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const computed = window.getComputedStyle(probe).color;
    document.body.removeChild(probe);
    // المتصفح بيرجع rgb/rgba دائماً
    if (computed && computed.startsWith("rgb")) {
      return computed;
    }
  } catch {
    // fallback
  }
  return "#0f172a"; // slate-900 fallback
}

/**
 * تنظيف كل الألوان غير المدعومة من عنصر مستنسخ.
 * - يمسح جميع الـ <style> و <link> stylesheets
 * - يطبّق الألوان المحسوبة كـ inline styles بصيغة rgb()
 * - يحوّل الـ gradients إلى ألوان صلبة (html2canvas لا يدعم lab() داخل gradients)
 */
function sanitizeAllStyles(root: HTMLElement) {
  // جمع كل العناصر
  const allEls = [root, ...Array.from(root.querySelectorAll("*"))];

  for (const el of allEls) {
    const htmlEl = el as HTMLElement;
    const cs = window.getComputedStyle(htmlEl);

    // الألوان الأساسية
    const color = cs.color;
    const bg = cs.backgroundColor;
    const border = cs.borderColor;
    const bgImage = cs.backgroundImage;

    // لون النص
    if (color && !color.startsWith("rgb")) {
      htmlEl.style.color = resolveColorToRgb(color);
    } else if (color) {
      htmlEl.style.color = color;
    }

    // لون الخلفية
    if (bg && !bg.startsWith("rgb") && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      htmlEl.style.backgroundColor = resolveColorToRgb(bg);
    } else if (bg) {
      htmlEl.style.backgroundColor = bg;
    }

    // لون الحدود
    if (border && !border.startsWith("rgb")) {
      htmlEl.style.borderColor = resolveColorToRgb(border);
    } else if (border) {
      htmlEl.style.borderColor = border;
    }

    // التدرجات اللونية: لو فيها lab() أو oklch() أو color-mix() نستبدلها بلون صلب
    if (
      bgImage &&
      bgImage !== "none" &&
      (bgImage.includes("lab(") ||
        bgImage.includes("oklch(") ||
        bgImage.includes("color-mix("))
    ) {
      // نحاول نستخرج أول لون rgb من التدرج لو فيه
      const rgbMatch = bgImage.match(/rgb[a]?\([^)]+\)/);
      if (rgbMatch) {
        htmlEl.style.backgroundImage = "none";
        htmlEl.style.backgroundColor = rgbMatch[0];
      } else {
        // fallback: نحوّل أي لون lab/oklch في التدرج بالمتصفح
        const cleaned = bgImage
          .replace(/lab\([^)]*(?:\([^)]*\)[^)]*)*\)/g, "rgb(2,132,199)")
          .replace(/oklch\([^)]*(?:\([^)]*\)[^)]*)*\)/g, "rgb(2,132,199)")
          .replace(/color-mix\([^)]*(?:\([^)]*\)[^)]*)*\)/g, "rgb(2,132,199)");
        htmlEl.style.backgroundImage = cleaned;
      }
    }

    // الـ outline color
    const outlineColor = cs.outlineColor;
    if (outlineColor && !outlineColor.startsWith("rgb")) {
      htmlEl.style.outlineColor = resolveColorToRgb(outlineColor);
    }

    // box-shadow: لو فيه lab/oklch (نادر لكن ممكن)
    const boxShadow = cs.boxShadow;
    if (
      boxShadow &&
      boxShadow !== "none" &&
      (boxShadow.includes("lab(") || boxShadow.includes("oklch("))
    ) {
      htmlEl.style.boxShadow = "none";
    }
  }

  // حذف جميع الـ stylesheets من المستند المنسوخ لمنع html2canvas من تحليلها
  root.querySelectorAll('style, link[rel="stylesheet"]').forEach((s) => s.remove());
}

/**
 * تنظيف مستند مستنسخ (onclone) — ينظف كل <style> tags بالتحديد
 * هذا يُستخدم كطبقة حماية إضافية مع onclone في html2canvas
 */
function sanitizeClonedDoc(clonedDoc: Document) {
  // 1) regex شامل لتنظيف أي lab/oklch/color-mix من الـ <style> tags
  const labPattern = /lab\([^)]*(?:\([^)]*\)[^)]*)*\)/g;
  const oklchPattern = /oklch\([^)]*(?:\([^)]*\)[^)]*)*\)/g;
  const colorMixPattern = /color-mix\([^)]*(?:\([^)]*\)[^)]*)*\)/g;
  
  clonedDoc.querySelectorAll("style").forEach((s) => {
    if (s.textContent) {
      s.textContent = s.textContent
        .replace(labPattern, "rgb(2, 132, 199)")
        .replace(oklchPattern, "rgb(2, 132, 199)")
        .replace(colorMixPattern, "rgb(2, 132, 199)");
    }
  });

  // 2) حذف الـ external stylesheets — html2canvas بيحاول يحللها ويقع في نفس الخطأ
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    link.remove();
  });

  // 3) إخفاء العناصر غير المطلوبة للطباعة
  clonedDoc.querySelectorAll(".no-print").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

  // 4) إصلاح مسارات الصور النسبية
  clonedDoc.querySelectorAll("img").forEach((img) => {
    if (img.src && img.src.startsWith("/")) {
      img.src = window.location.origin + img.src;
    }
  });
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
        document.querySelector(".printable-content")) as HTMLElement;

      if (!element) {
        throw new Error("لم يتم العثور على العنصر");
      }

      // نسخ العنصر وإصلاح الألوان قبل إرساله لـ html2canvas
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // إخفاء العناصر غير المطلوبة
      clonedElement.querySelectorAll(".no-print").forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // إضافة للـ body مؤقتاً (مخفي) عشان getComputedStyle يشتغل
      clonedElement.style.position = "absolute";
      clonedElement.style.left = "-99999px";
      clonedElement.style.top = "0";
      clonedElement.style.width = element.offsetWidth + "px";
      document.body.appendChild(clonedElement);

      // إصلاح شامل لكل الألوان في العنصر المنسوخ
      sanitizeAllStyles(clonedElement);

      // انتظار قصير للتأكد من تطبيق الـ styles
      await new Promise((r) => setTimeout(r, 300));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(clonedElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        onclone: (clonedDoc: Document) => {
          try {
            sanitizeClonedDoc(clonedDoc);
          } catch (err) {
            console.warn("خطأ في onclone:", err);
          }
        },
      });

      // تنظيف العنصر المؤقت
      if (clonedElement.parentNode) {
        document.body.removeChild(clonedElement);
      }

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("فشل في إنشاء الصورة من المحتوى");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      if (!imgData || imgData === "data:,") {
        throw new Error("فشل في تحويل المحتوى إلى صورة");
      }

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const renderWidth = pdfWidth - margin * 2;
      const renderHeight = (canvas.height * renderWidth) / canvas.width;

      if (renderHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, "JPEG", margin, margin, renderWidth, renderHeight);
      } else {
        let heightLeft = renderHeight;
        let position = margin;

        pdf.addImage(imgData, "JPEG", margin, position, renderWidth, renderHeight);
        heightLeft -= pdfHeight - margin * 2;

        while (heightLeft > 0) {
          position = heightLeft - renderHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", margin, position, renderWidth, renderHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("✅ تم تحميل ملف الـ PDF بنجاح");
    } catch (err) {
      console.error("خطأ PDF:", err);
      toast.error("حدث خطأ، جاري فتح الطباعة المباشرة...");
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
