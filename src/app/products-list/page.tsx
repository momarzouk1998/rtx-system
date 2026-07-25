import { prisma } from "@/lib/prisma";
import { Package } from "lucide-react";
import { AddProductButton } from "./AddProductButton";

export default async function ProductsListPage() {
  const products = await prisma.product.findMany({
    include: {
      material: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const materials = await prisma.material.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Package className="w-8 h-8 text-[#12829b]" />
          قائمة المنتجات
        </h1>
        <AddProductButton materials={materials} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">المنتج</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الخامة المرتبطة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">سعر الكيس</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">تكلفة التشغيل/كجم</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الأكياس/كجم</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">ربح الكيس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا توجد منتجات مسجلة. اضغط على "إضافة منتج" لإضافة منتجات جديدة.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.material.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {product.bagPrice} ج.م
                    </td>
                    <td className="px-6 py-4 text-orange-600 dark:text-orange-400">
                      {product.operatingCost} ج.م
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {product.bagsPerKg}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-medium">
                      {product.profitPerBag} ج.م
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
