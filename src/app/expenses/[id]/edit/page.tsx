import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateExpense } from "../../../actions/expenses";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  INTERNAL: "داخلي (مصاريف تشغيل)",
  FACTORY: "مصنع آخر (دفعة لمصنع)",
  SUPPLIER: "مورد (دفعة لمورد)",
};

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: { factory: true, supplier: true },
  });

  const factories = await prisma.factory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const suppliers = await prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (!expense) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updateExpense(params.id, formData);
    if (result.success) {
      redirect("/expenses");
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/expenses" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة المصروفات
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل المصروف</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التصنيف
            </label>
            <select
              name="category"
              defaultValue={expense.category}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="INTERNAL">داخلي (مصاريف تشغيل)</option>
              <option value="FACTORY">مصنع آخر (دفعة لمصنع)</option>
              <option value="SUPPLIER">مورد (دفعة لمورد)</option>
            </select>
          </div>

          {expense.category === "FACTORY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المصنع *
              </label>
              <select
                name="factoryId"
                defaultValue={expense.factoryId || ""}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">— اختر المصنع —</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {expense.category === "SUPPLIER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المورد *
              </label>
              <select
                name="supplierId"
                defaultValue={expense.supplierId || ""}
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
              defaultValue={expense.item}
              placeholder="مثال: إيجار، كهرباء، شحنة..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
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
              defaultValue={expense.amount}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/expenses"
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
