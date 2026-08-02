import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Settings, Factory, Edit } from "lucide-react";
import Link from "next/link";
import { AddProductionButton } from "./AddProductionButton";
import { DeleteButton } from "@/components/DeleteButton";
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
                <th className="px-4 py-3 text-xs bg-blue-50 text-blue-700">📤 تسليم خامات (كجم)</th>
                <th className="px-4 py-3 text-xs bg-emerald-50 text-emerald-700">📥 استلام منتج (كجم)</th>
                <th className="px-4 py-3 text-xs bg-emerald-50 text-emerald-700">الأكياس المنتجة</th>
                <th className="px-4 py-3 text-xs">تكلفة التشغيل</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productionOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد أوامر تصنيع. اضغط على "إضافة أمر تصنيع" للبدء.
                  </td>
                </tr>
              ) : (
                productionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.date).toISOString().split("T")[0]}
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
                    {/* تسليم خامات - خلفية زرقاء */}
                    <td className="px-4 py-3 bg-blue-50/30 border-l-2 border-blue-200">
                      {order.quantityKg > 0 ? (
                        <span className="text-blue-700 font-bold text-sm">
                          {order.quantityKg} كجم
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {/* استلام منتج - خلفية خضراء */}
                    <td className="px-4 py-3 bg-emerald-50/30">
                      {order.receivedQuantityKg && order.receivedQuantityKg > 0 ? (
                        <span className="text-emerald-700 font-bold text-sm">
                          {order.receivedQuantityKg} كجم
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {/* الأكياس - خلفية خضراء */}
                    <td className="px-4 py-3 bg-emerald-50/30 border-r-2 border-emerald-200">
                      {order.packagedBags > 0 ? (
                        <span className="text-emerald-600 font-bold text-sm">
                          {order.packagedBags} كيس
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {order.totalOperatingCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/production-stage/${order.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemName={order.product.name} id={order.id} deleteAction={deleteProductionOrder} />
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
