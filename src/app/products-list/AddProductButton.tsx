'use client';

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createProduct } from "../actions/products";
import toast from "react-hot-toast";

type Material = { id: string; name: string };

export function AddProductButton({ materials }: { materials: Material[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createProduct(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم إضافة المنتج بنجاح");
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
        إضافة منتج
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="إضافة منتج جديد">
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم المنتج *
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="مثال: فواصل 1.5 ملي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الخامة المرتبطة *
            </label>
            <select 
              name="materialId" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="">اختر الخامة الأساسية...</option>
              {materials.map((mat) => (
                <option key={mat.id} value={mat.id}>{mat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                سعر الكيس (ج.م)
              </label>
              <input 
                type="number" 
                name="bagPrice" 
                defaultValue="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تكلفة التشغيل/كجم (ج.م)
              </label>
              <input 
                type="number" 
                name="operatingCost" 
                defaultValue="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الأكياس/كجم (معامل التحويل)
              </label>
              <input 
                type="number" 
                name="bagsPerKg" 
                defaultValue="1"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ربح الكيس (ج.م)
              </label>
              <input 
                type="number" 
                name="profitPerBag" 
                defaultValue="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
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
