import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Layers, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { AddMaterialButton } from "./AddMaterialButton";
import { deleteMaterial } from "../actions/materials";

export default async function MaterialsListPage() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
    // Later we can include stock calculations here
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{materials.length} خامة</p>
        <AddMaterialButton />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">الخامة</th>
                <th className="px-4 py-3 text-xs">السعر القياسي/كجم</th>
                <th className="px-4 py-3 text-xs">الرصيد الافتتاحي</th>
                <th className="px-4 py-3 text-xs">تاريخ الإضافة</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا توجد خامات مسجلة. اضغط على "إضافة خامة" لإضافة خامات جديدة.
                  </td>
                </tr>
              ) : (
                materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{mat.name}</div>
                      {mat.notes && <div className="text-sm text-gray-500 mt-1">{mat.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold text-sm">
                      {mat.price}                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {mat.openingBalance} كجم
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(mat.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/materials-list/${mat.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={async () => {
                          'use server';
                          await deleteMaterial(mat.id);
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
