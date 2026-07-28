import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { Briefcase } from "lucide-react";
import { AddMaterialButton } from "./AddMaterialButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteMaterialTransaction } from "../actions/materials";

export default async function MaterialsStagePage() {
  const [addMaterials, suppliers, materials] = await Promise.all([
    prisma.addMaterial.findMany({
      orderBy: { date: "desc" },
      include: {
        supplier: true,
        material: true,
      }
    }),
    prisma.supplier.findMany({ select: { id: true, name: true } }),
    prisma.material.findMany({ select: { id: true, name: true, price: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#38bdf8] flex items-center gap-2">
            <Briefcase className="text-[#38bdf8] w-8 h-8" /> مرحلة الخامات
          </h2>
          <p className="mt-1 text-gray-400">سجل عمليات توريد الخامات من الموردين للمخزن</p>
        </div>
        <AddMaterialButton suppliers={suppliers} materials={materials} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">المورد</th>
                <th className="px-4 py-3 text-xs">الخامة</th>
                <th className="px-4 py-3 text-xs">الكمية (كجم)</th>
                <th className="px-4 py-3 text-xs">سعر الكيلو</th>
                <th className="px-4 py-3 text-xs">الإجمالي</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {addMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد عمليات توريد خامات مسجلة.
                  </td>
                </tr>
              ) : (
                addMaterials.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(item.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{item.supplier.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {item.material.name}
                    </td>
                    <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">
                      {item.quantityKg}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.unitPrice}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#38bdf8] text-sm">
                      {item.totalCost.toLocaleString("ar-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <DeleteButton itemName="عملية التوريد" id={item.id} deleteAction={deleteMaterialTransaction} />
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
