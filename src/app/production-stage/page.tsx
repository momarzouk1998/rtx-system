import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Settings, Factory, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { AddProductionButton } from "./AddProductionButton";
import { deleteProductionOrder } from "../actions/production";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{productionOrders.length} أمر تصنيع</p>
        <AddProductionButton factories={factories} products={products} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">التصنيف</th>
                <th className="px-4 py-3 text-xs">المنتج / الخامة</th>
                <th className="px-4 py-3 text-xs">الكمية (كجم)</th>
                <th className="px-4 py-3 text-xs">الأكياس المنتجة</th>
                <th className="px-4 py-3 text-xs">تكلفة التشغيل</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productionOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد أوامر تصنيع. اضغط على "إضافة أمر تصنيع" للبدء.
                  </td>
                </tr>
              ) : (
                productionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      {order.category === 'INTERNAL' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          تصنيع داخلي
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                            مصنع آخر
                          </span>
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Factory className="w-3 h-3" />
                            {order.factory?.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{order.product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">خامة: {order.material.name}</div>
                    </td>
                    <td className="px-4 py-3 text-orange-600 font-medium text-sm">
                      {order.quantityKg} كجم
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium text-sm">
                      {order.packagedBags} كيس
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {order.totalOperatingCost.toLocaleString()}                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/production-stage/${order.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={async () => {
                          'use server';
                          await deleteProductionOrder(order.id);
                        }} className="inline">
                          <button type="submit" className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
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
