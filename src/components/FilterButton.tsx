"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

export type FilterField =
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { type: "date"; name: string; label: string };

interface FilterButtonProps {
  title: string;
  basePath: string;
  /** searchParams الحالية زي ما جايه من الصفحة (بتتحول لسترينج بس) */
  searchParams: Record<string, string | string[] | undefined>;
  fields: FilterField[];
}

function toStringValue(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** زرار "تصفية" بيفتح مودال فيه فلاتر إضافية (حالة/تصنيف/تاريخ...) وبيطبقها عن طريق query params في الرابط */
export function FilterButton({ title, basePath, searchParams, fields }: FilterButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.name] = toStringValue(searchParams[f.name]);
    return initial;
  });

  const activeFiltersCount = fields.filter((f) => toStringValue(searchParams[f.name])).length;

  function buildParams(values: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (fields.some((f) => f.name === key) || key === "page") continue;
      const str = toStringValue(value);
      if (str) params.set(key, str);
    }
    for (const f of fields) {
      const v = values[f.name];
      if (v) params.set(f.name, v);
    }
    return params;
  }

  function applyFilters() {
    const params = buildParams(pending);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    setOpen(false);
  }

  function clearFilters() {
    const cleared: Record<string, string> = {};
    for (const f of fields) cleared[f.name] = "";
    setPending(cleared);
    const params = buildParams(cleared);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
      >
        <SlidersHorizontal className="w-4 h-4" />
        تصفية
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#12829b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      value={pending[f.name]}
                      onChange={(e) => setPending((p) => ({ ...p, [f.name]: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">الكل</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="date"
                      value={pending[f.name]}
                      onChange={(e) => setPending((p) => ({ ...p, [f.name]: e.target.value }))}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                مسح الفلاتر
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded-lg bg-[#12829b] text-white text-sm font-medium hover:bg-[#0e687c]"
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
