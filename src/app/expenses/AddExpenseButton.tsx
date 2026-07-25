'use client';

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createExpense } from "../actions/expenses";
import toast from "react-hot-toast";

type Partner = { id: string; name: string };

export function AddExpenseButton({
  factories,
  suppliers,
}: {
  factories: Partner[];
  suppliers: Partner[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("INTERNAL");

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createExpense(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم تسجيل المصروف بنجاح");
      setIsOpen(false);
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#12829b] hover:bg-[#0e687c] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        تسجيل مصروف
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="تسجيل مصروف جديد">
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التصنيف
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="INTERNAL">داخلي (مصاريف تشغيل)</option>
              <option value="FACTORY">مصنع آخر (دفعة لمصنع)</option>
              <option value="SUPPLIER">مورد (دفعة لمورد)</option>
            </select>
          </div>

          {category === "FACTORY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المصنع *
              </label>
              <select
                name="factoryId"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">— اختر المصنع —</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {category === "SUPPLIER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المورد *
              </label>
              <select
                name="supplierId"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">— اختر المورد —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              وصف المصروف *
            </label>
            <input
              type="text"
              name="item"
              required
              placeholder="مثال: إيجار، كهرباء، شحنة..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المبلغ (ج.م) *
            </label>
            <input
              type="number"
              name="amount"
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : 'حفظ'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
