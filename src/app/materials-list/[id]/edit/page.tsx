import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateMaterial } from "../../../actions/materials";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await prisma.material.findUnique({
    where: { id },
  });

  if (!material) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updateMaterial(id, formData);
    if (result.success) {
      redirect("/materials-list");
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/materials-list" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة الخامات
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل الخامة</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم الخامة *
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={material.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="مثال: تصنيع 60 80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              السعر القياسي (كجم)
            </label>
            <input 
              type="number" 
              name="price" 
              defaultValue={material.price}
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الرصيد الافتتاحي (كجم)
            </label>
            <input 
              type="number" 
              name="openingBalance" 
              defaultValue={material.openingBalance}
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ملاحظات
            </label>
            <textarea 
              name="notes" 
              rows={3}
              defaultValue={material.notes || ""}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/materials-list"
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
