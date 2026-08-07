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

  const handleDownloadPdf = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // ── Find the target element ────────────────────────────────────────────
      const element = (
        document.getElementById(targetId) ||
        document.querySelector(".printable-statement-content") ||
        document.querySelector(".printable-content")
      ) as HTMLElement | null;

      if (!element) throw new Error("لم يتم العثور على العنصر المراد طباعته");

      // ── Pre-fetch and strip oklch/lab from every external stylesheet ───────
      // html2canvas fetches CSS itself and crashes on oklch/lab — we must
      // intercept and clean BEFORE it does.
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

      // ── Render to canvas ───────────────────────────────────────────────────
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
            clonedDoc.querySelectorAll(".no-print").forEach((el) =>
              (el as HTMLElement).style.setProperty("display", "none", "important")
            );

            clonedDoc.querySelectorAll("img").forEach((img) => {
              const src = (img as HTMLImageElement).getAttribute("src");
              if (src?.startsWith("/"))
                (img as HTMLImageElement).src = window.location.origin + src;
            });

            // Swap external stylesheets with pre-cleaned versions
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

            // Clean any inline <style> tags too
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

      // ── Build multi-page A4 PDF ────────────────────────────────────────────
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4", compress: true });
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
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
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

// ─── CSS Color Cleaner ────────────────────────────────────────────────────────
// Proper mathematical conversion of oklch/lab → rgb so html2canvas never sees
// unsupported color functions. Used for FactoryStatement (which has no print
// template yet) and as a safety net for any remaining CSS.

function oklchToRgb(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const rL =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gL = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bL = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const g = (c: number) => Math.round(Math.max(0, Math.min(1, c)) <= 0.0031308
    ? Math.max(0, Math.min(1, c)) * 12.92 * 255
    : (1.055 * Math.max(0, Math.min(1, c)) ** (1 / 2.4) - 0.055) * 255);
  return `rgb(${g(rL)},${g(gL)},${g(bL)})`;
}

function labToRgb(L: number, a: number, b: number): string {
  const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - b / 200;
  const ε = 0.008856, κ = 903.3;
  const x = (fx ** 3 > ε ? fx ** 3 : (116 * fx - 16) / κ) * 0.96422;
  const y = L > κ * ε ? ((L + 16) / 116) ** 3 : L / κ;
  const z = (fz ** 3 > ε ? fz ** 3 : (116 * fz - 16) / κ) * 0.82521;
  const rL =  3.1338561 * x - 1.6168667 * y - 0.4906146 * z;
  const gL = -0.9787684 * x + 1.9161415 * y + 0.033454 * z;
  const bL =  0.0719453 * x - 0.2289914 * y + 1.4052427 * z;
  const g = (c: number) => Math.round(Math.max(0, Math.min(1, c)) <= 0.0031308
    ? Math.max(0, Math.min(1, c)) * 12.92 * 255
    : (1.055 * Math.max(0, Math.min(1, c)) ** (1 / 2.4) - 0.055) * 255);
  return `rgb(${g(rL)},${g(gL)},${g(bL)})`;
}

function convertArgs(fn: string, raw: string): string {
  try {
    const p = raw.split("/")[0].trim().split(/[\s,]+/).filter(Boolean).map(s => s === "none" ? "0" : s);
    const v = (s: string, pct = false) => s.endsWith("%") ? parseFloat(s) / (pct ? 1 : 100) : parseFloat(s);
    if (fn === "oklch") return oklchToRgb(v(p[0] ?? "0"), v(p[1] ?? "0"), parseFloat(p[2] ?? "0"));
    if (fn === "lab")  return labToRgb(v(p[0] ?? "0", true), v(p[1] ?? "0", true), v(p[2] ?? "0", true));
  } catch { /* fall through */ }
  return fn === "lab" ? "#0f172a" : "#0ea5e9";
}

function cleanCSS(css: string): string {
  return css
    .replace(/(oklch|lab)\((?:[^()]*|\([^()]*\))*\)/gi, (m, fn: string) =>
      convertArgs(fn.toLowerCase(), m.slice(fn.length + 1, -1))
    )
    .replace(/color-mix\((?:[^()]*|\([^()]*\))*\)/gi, "#0284c7");
}
