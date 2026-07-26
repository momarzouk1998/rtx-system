import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateProduct } from "../../../actions/products";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { material: true },
  });

  const materials = await prisma.material.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  if (!product) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updateProduct(id, formData);
    if (result.success) {
      redirect("/products-list");
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/products-list" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة المنتجات
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل المنتج</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم المنتج *
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={product.name}
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
              defaultValue={product.materialId}
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
                سعر الكيس
              </label>
              <input 
                type="number" 
                name="bagPrice" 
                defaultValue={product.bagPrice}
                step="any"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تكلفة التشغيل/كجم
              </label>
              <input 
                type="number" 
                name="operatingCost" 
                defaultValue={product.operatingCost}
                step="any"
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
                defaultValue={product.bagsPerKg}
                step="any"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ربح الكيس
              </label>
              <input 
                type="number" 
                name="profitPerBag" 
                defaultValue={product.profitPerBag}
                step="any"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/products-list"
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
