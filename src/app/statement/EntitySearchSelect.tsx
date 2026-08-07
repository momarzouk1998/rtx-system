"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, ChevronDown, Check, Sparkles, X } from "lucide-react";

export interface EntityItem {
  id: string;
  name: string;
}

export function EntitySearchSelect({
  type,
  typeLabel,
  selectedId,
  items,
}: {
  type: string;
  typeLabel: string;
  selectedId?: string;
  items: EntityItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isAll = selectedId === "all" || !selectedId;
  const pluralLabel =
    typeLabel === "المورد"
      ? "الموردين"
      : typeLabel === "المصنع"
      ? "المصانع"
      : "العملاء";

  const selectedItem = isAll
    ? { id: "all", name: `كشف مجمع (جميع ${pluralLabel})` }
    : items.find((i) => i.id === selectedId) || null;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setIsOpen(false);
    setSearchTerm("");
    startTransition(() => {
      router.push(`/statement?type=${type}&id=${id}`);
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 p-3.5 no-print relative">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#0ea5e9]" />
          اختر {typeLabel}:
        </label>

        {selectedItem && (
          <span className="text-xs font-bold text-[#0ea5e9] bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#0ea5e9]" />
            {selectedItem.name}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Search Box Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`ابحث باسم ${typeLabel}... (${items.length} حساب متاح)`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-8 pr-9 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            عرض القائمة
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#0ea5e9] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown Options Popup */}
        {isOpen && (
          <>
            {/* Transparent Overlay */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            <div className="absolute right-0 left-0 top-full mt-2 z-20 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 space-y-1">
              {/* Option 1: All / كشف مجمع */}
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`w-full text-right px-3 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                  selectedId === "all" || !selectedId
                    ? "bg-[#0ea5e9] text-white shadow-xs"
                    : "bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100"
                }`}
              >
                <span>📊 كشف مجمع شامل (جميع {pluralLabel})</span>
                {(selectedId === "all" || !selectedId) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Items List Header */}
              {searchTerm && (
                <div className="px-3 py-1 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  نتائج البحث ({filteredItems.length}):
                </div>
              )}

              {/* Filtered Items List */}
              <div className="space-y-0.5">
                {filteredItems.length === 0 ? (
                  <div className="p-4 text-center text-xs font-bold text-slate-400">
                    لا توجد نتائج تطابق "{searchTerm}"
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>{item.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#0ea5e9]" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
