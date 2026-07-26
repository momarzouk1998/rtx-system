import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updatePayment } from "../../../actions/payments";
import { ArrowRight } from "lucide-react";
import { toDateInputValue } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { client: true },
  });

  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (!payment) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updatePayment(id, formData);
    if (result.success) {
      redirect("/payments");
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/payments" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة المدفوعات
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل الدفعة</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التاريخ
            </label>
            <input
              type="date"
              name="date"
              defaultValue={toDateInputValue(payment.date)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العميل *
            </label>
            <select
              name="clientId"
              required
              defaultValue={payment.clientId}
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
              المبلغ *
            </label>
            <input
              type="number"
              name="amount"
              required
              step="0.01"
              min="0"
              defaultValue={payment.amount}
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
                defaultValue={payment.method || ""}
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
                defaultValue={payment.paymentType || "DEBT_PAYMENT"}
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
              defaultValue={payment.notes || ""}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/payments"
              className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
