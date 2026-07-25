'use client';

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createPayment } from "../actions/payments";
import toast from "react-hot-toast";

type Client = { id: string; name: string };

export function AddPaymentButton({ clients }: { clients: Client[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createPayment(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم تسجيل الدفعة بنجاح");
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
        تسجيل دفعة
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="تسجيل دفعة جديدة">
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العميل *
            </label>
            <select
              name="clientId"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="">— اختر العميل —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                طريقة الدفع
              </label>
              <select
                name="method"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">— اختر —</option>
                <option value="CASH">نقدي</option>
                <option value="WALLET">محفظة</option>
                <option value="INSTAPAY">إنستاباي</option>
                <option value="BANK_TRANSFER">تحويل بنكي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نوع الدفعة
              </label>
              <select
                name="paymentType"
                defaultValue="DEBT_PAYMENT"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="DEBT_PAYMENT">سداد مديونية</option>
                <option value="REFUND">إرجاع</option>
                <option value="DEPOSIT">تأمين</option>
                <option value="ON_ACCOUNT">تحت الحساب</option>
                <option value="OTHER">أخرى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ملاحظات
            </label>
            <input
              type="text"
              name="notes"
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
