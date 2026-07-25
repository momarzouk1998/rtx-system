import { prisma } from "@/lib/prisma";
import { Layers } from "lucide-react";
import { AddMaterialButton } from "./AddMaterialButton";

export default async function MaterialsListPage() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
    // Later we can include stock calculations here
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#12829b]" />
          قائمة الخامات
        </h1>
        <AddMaterialButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الخامة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">السعر القياسي/كجم</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الرصيد الافتتاحي</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا توجد خامات مسجلة. اضغط على "إضافة خامة" لإضافة خامات جديدة.
                  </td>
                </tr>
              ) : (
                materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{mat.name}</div>
                      {mat.notes && <div className="text-sm text-gray-500 mt-1">{mat.notes}</div>}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {mat.price} ج.م
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {mat.openingBalance} كجم
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(mat.createdAt).toLocaleDateString('ar-EG')}
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