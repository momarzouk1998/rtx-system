import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Settings, Factory } from "lucide-react";
import { AddProductionButton } from "./AddProductionButton";

export default async function ProductionStagePage() {
  const productionOrders = await prisma.productionOrder.findMany({
    orderBy: { date: "desc" },
    include: {
      factory: true,
      product: true,
      material: true,
      createdBy: true,
    }
  });

  const factories = await prisma.factory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, bagsPerKg: true, operatingCost: true, material: { select: { name: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#12829b]" />
          مرحلة التصنيع
        </h1>
        <AddProductionButton factories={factories} products={products} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التصنيف</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">المنتج / الخامة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الكمية (كجم)</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الأكياس المنتجة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">تكلفة التشغيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {productionOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا يوجد أوامر تصنيع. اضغط على "إضافة أمر تصنيع" للبدء.
                  </td>
                </tr>
              ) : (
                productionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(order.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      {order.category === 'INTERNAL' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          تصنيع داخلي
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                            مصنع آخر
                          </span>
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Factory className="w-3 h-3" />
                            {order.factory?.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{order.product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">خامة: {order.material.name}</div>
                    </td>
                    <td className="px-6 py-4 text-orange-600 dark:text-orange-400 font-medium">
                      {order.quantityKg} كجم
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {order.packagedBags} كيس
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {order.totalOperatingCost.toLocaleString()} ج.م
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
