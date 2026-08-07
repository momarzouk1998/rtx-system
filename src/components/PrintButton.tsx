"use client";

import { useState } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// تحويل oklch → rgb (الصيغة الرياضية الدقيقة)
// Tailwind v4 يستخدم oklch لكل الألوان، html2canvas لا يفهمها
// ─────────────────────────────────────────────────────────────────────────────
function oklchToRgb(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // oklab → LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  // LMS → linear sRGB
  const rLin =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toSrgb = (c: number) => {
    const v = Math.max(0, Math.min(1, c));
    return Math.round(
      (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255
    );
  };

  return `rgb(${toSrgb(rLin)},${toSrgb(gLin)},${toSrgb(bLin)})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// تحويل lab → rgb (D50 white point)
// ─────────────────────────────────────────────────────────────────────────────
function labToRgb(L: number, a: number, b: number): string {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const ε = 0.008856;
  const κ = 903.3;
  const xr = fx ** 3 > ε ? fx ** 3 : (116 * fx - 16) / κ;
  const yr = L > κ * ε ? ((L + 16) / 116) ** 3 : L / κ;
  const zr = fz ** 3 > ε ? fz ** 3 : (116 * fz - 16) / κ;

  // D50 white point
  const x = xr * 0.96422;
  const y = yr * 1.0;
  const z = zr * 0.82521;

  // XYZ D50 → linear sRGB
  const rLin =  3.1338561 * x - 1.6168667 * y - 0.4906146 * z;
  const gLin = -0.9787684 * x + 1.9161415 * y + 0.033454 * z;
  const bLin =  0.0719453 * x - 0.2289914 * y + 1.4052427 * z;

  const toSrgb = (c: number) => {
    const v = Math.max(0, Math.min(1, c));
    return Math.round(
      (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255
    );
  };

  return `rgb(${toSrgb(rLin)},${toSrgb(gLin)},${toSrgb(bLin)})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// تحويل string oklch/lab إلى rgb مع parsing للقيم
// ─────────────────────────────────────────────────────────────────────────────
function convertColorArgs(fn: string, rawArgs: string): string {
  try {
    // نتجاهل قيمة alpha بعد /
    const colorPart = rawArgs.split("/")[0].trim();
    const parts = colorPart
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((p) => (p === "none" ? "0" : p));

    const parseNum = (s: string, pct = false) => {
      if (!s) return 0;
      return s.endsWith("%")
        ? parseFloat(s) / (pct ? 1 : 100)
        : parseFloat(s);
    };

    if (fn === "oklch") {
      const L = parseNum(parts[0] ?? "0");
      const C = parseNum(parts[1] ?? "0");
      const H = parseFloat(parts[2] ?? "0");
      if (!isNaN(L) && !isNaN(C)) return oklchToRgb(L, C, H);
    } else if (fn === "lab") {
      const L = parseNum(parts[0] ?? "0", true);
      const a = parseNum(parts[1] ?? "0", true);
      const b = parseNum(parts[2] ?? "0", true);
      if (!isNaN(L)) return labToRgb(L, a, b);
    }
  } catch {
    // ignore
  }
  return fn === "lab" ? "#0f172a" : "#0ea5e9";
}

// ─────────────────────────────────────────────────────────────────────────────
// تنظيف CSS: استبدال oklch/lab/color-mix بـ rgb صحيح
// ─────────────────────────────────────────────────────────────────────────────
function cleanCSS(css: string): string {
  // نعالج oklch() و lab() مع دعم قوس واحد داخلي
  let result = css.replace(
    /(oklch|lab)\((?:[^()]*|\([^()]*\))*\)/gi,
    (match, fn: string) => {
      const inner = match.slice(fn.length + 1, -1);
      return convertColorArgs(fn.toLowerCase(), inner);
    }
  );

  // color-mix: نستبدلها بالون الـ brand
  result = result.replace(
    /color-mix\((?:[^()]*|\([^()]*\))*\)/gi,
    "#0284c7"
  );

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────────────────────────────────────
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
    setIsGeneratingPdf(true);

    try {
      const element = (
        document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content")
      ) as HTMLElement | null;

      if (!element) throw new Error("لم يتم العثور على العنصر المراد طباعته");

      // ── الخطوة 1: جلب وتنظيف ملفات CSS الخارجية قبل html2canvas ──────────
      // html2canvas يجلب الـ CSS بنفسه ويحلّلها — لازم نسبقه
      const cssCache = new Map<string, string>();
      await Promise.all(
        Array.from(
          document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
        ).map(async (link) => {
          try {
            const res = await fetch(link.href);
            const raw = await res.text();
            cssCache.set(link.href, cleanCSS(raw));
          } catch {
            cssCache.set(link.href, "");
          }
        })
      );

      // ── الخطوة 2: html2canvas مع onclone يحقن CSS المنظّف ────────────────
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
          try {
            // إخفاء عناصر no-print
            clonedDoc.querySelectorAll(".no-print").forEach((el) => {
              (el as HTMLElement).style.setProperty(
                "display",
                "none",
                "important"
              );
            });

            // إصلاح مسارات الصور النسبية
            clonedDoc.querySelectorAll("img").forEach((img) => {
              const src = (img as HTMLImageElement).getAttribute("src");
              if (src?.startsWith("/"))
                (img as HTMLImageElement).src =
                  window.location.origin + src;
            });

            // استبدال الروابط الخارجية بالـ CSS المنظّف
            clonedDoc
              .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
              .forEach((link) => {
                const cleaned = cssCache.get(link.href) ?? "";
                if (cleaned) {
                  const style = clonedDoc.createElement("style");
                  style.textContent = cleaned;
                  link.parentNode?.insertBefore(style, link);
                }
                link.remove();
              });

            // تنظيف الـ <style> الداخلية أيضاً
            clonedDoc.querySelectorAll("style").forEach((s) => {
              if (s.textContent) s.textContent = cleanCSS(s.textContent);
            });
          } catch (e) {
            console.warn("onclone:", e);
          }
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0)
        throw new Error("فشل في تحويل الصفحة إلى صورة");

      const imgData = canvas.toDataURL("image/jpeg", 0.93);
      if (!imgData || imgData === "data:,")
        throw new Error("فشل في توليد صورة المحتوى");

      // ── الخطوة 3: PDF متعدد الصفحات بقياس A4 ────────────────────────────
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const mx = 8;
      const my = 8;
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
      console.error("❌ خطأ PDF:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`خطأ: ${msg.slice(0, 100)}`);
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
