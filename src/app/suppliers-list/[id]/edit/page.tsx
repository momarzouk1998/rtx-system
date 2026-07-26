import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateSupplier } from "../../../actions/partners";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updateSupplier(id, formData);
    if (result.success) {
      redirect(`/suppliers-list`);
    }
  }

  return (
    <div className="space-y-4">
      <Link href={`/suppliers-list`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة الموردين
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل بيانات المورد</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم المورد *
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={supplier.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="مثال: شركة النور للموراد"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم الهاتف
              </label>
              <input 
                type="tel" 
                name="phone" 
                defaultValue={supplier.phone || ""}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                dir="ltr"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم الواتساب
              </label>
              <input 
                type="tel" 
                name="whatsapp" 
                defaultValue={supplier.whatsapp || ""}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                dir="ltr"
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان
            </label>
            <input 
              type="text" 
              name="address" 
              defaultValue={supplier.address || ""}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الرصيد الافتتاحي
            </label>
            <input 
              type="number" 
              name="openingBalance" 
              defaultValue={supplier.openingBalance}
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-blue-800 mb-1">💡 شرح الرصيد الافتتاحي:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>بالموجب (مثلاً 1000): المورد مدين لك بهذا المبلغ (عليك دفع له)</li>
                <li>بالسالب (مثلاً -500): رصيد دائن للمورد (أنت دفعت له مقدماً)</li>
                <li>صفر: حساب جديد لا يوجد عليه رصيد سابق</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href={`/suppliers-list`}
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
