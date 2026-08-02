"use client";

import { useState, useTransition } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Scale, X, Loader2 } from "lucide-react";
import { addInventoryTransactionAction } from "../actions/inventory";

interface MaterialOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

export function AddTransactionModal({
  materials,
  products,
}: {
  materials: MaterialOption[];
  products: ProductOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [itemType, setItemType] = useState<"MATERIAL" | "PRODUCT">("MATERIAL");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [materialId, setMaterialId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("ADJUSTMENT");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addInventoryTransactionAction(formData);
      if (res.success) {
        setIsOpen(false);
        setQuantity("");
        setNotes("");
      } else {
        alert(res.error || "حدث خطأ");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        تسجيل حركة مخزنية (وارد / منصرف)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-zinc-800">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                تسجيل حركة مخزنية جديدة
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="itemType" value={itemType} />
              <input type="hidden" name="type" value={type} />

              {/* Selector for Item Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  نوع الصنف *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setItemType("MATERIAL"); setMaterialId(""); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      itemType === "MATERIAL"
                        ? "bg-[#0284c7] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    📦 خامات ورسائل
                  </button>
                  <button
                    type="button"
                    onClick={() => { setItemType("PRODUCT"); setProductId(""); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      itemType === "PRODUCT"
                        ? "bg-[#0284c7] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    🏷️ منتجات جاهزة (أكياس)
                  </button>
                </div>
              </div>

              {/* Direction: IN or OUT */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  اتجاه الحركة *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("IN")}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      type === "IN"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> 📥 إدخال (وارد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("OUT")}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      type === "OUT"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> 📤 إخراج (منصرف)
                  </button>
                </div>
              </div>

              {/* Item Selection */}
              {itemType === "MATERIAL" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    اسم الخامة *
                  </label>
                  <select
                    name="materialId"
                    required
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm font-semibold"
                  >
                    <option value="">اختر الخامة...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    اسم المنتج *
                  </label>
                  <select
                    name="productId"
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm font-semibold"
                  >
                    <option value="">اختر المنتج...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  الكمية {itemType === "MATERIAL" ? "(كيلوجرام)" : "(عدد الأكياس)"} *
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="مثال: 500"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-base font-extrabold"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  سبب الحركة / البيان
                </label>
                <select
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="ADJUSTMENT">تسوية وتعديل مخزني</option>
                  <option value="PURCHASE">شراء / توريد من مورد</option>
                  <option value="SALES">بيع / خروج لعميل</option>
                  <option value="PRODUCTION_PRODUCT_IN">استلام من خط التصنيع</option>
                  <option value="PRODUCTION_MATERIAL_OUT">صرف للتشغيل والتصنيع</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  ملاحظات وتفاصيل إضافية
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending || !quantity}
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الحركة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
