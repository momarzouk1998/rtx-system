import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Package, Edit } from "lucide-react";
import Link from "next/link";
import { AddProductButton } from "./AddProductButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteProduct } from "../actions/products";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{products.length} منتج</p>
        <AddProductButton materials={materials} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">المنتج</th>
                <th className="px-4 py-3 text-xs">الخامة المرتبطة</th>
                <th className="px-4 py-3 text-xs">سعر الكيس</th>
                <th className="px-4 py-3 text-xs">تكلفة التشغيل/كجم</th>
                <th className="px-4 py-3 text-xs">الأكياس/كجم</th>
                <th className="px-4 py-3 text-xs">ربح الكيس</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد منتجات مسجلة. اضغط على "إضافة منتج" لإضافة منتجات جديدة.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        {product.material.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold text-sm">
                      {product.bagPrice}                    </td>
                    <td className="px-4 py-3 text-orange-600 text-sm">
                      {product.operatingCost}                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {product.bagsPerKg}
                    </td>
                    <td className="px-4 py-3 text-indigo-600 font-medium text-sm">
                      {product.profitPerBag}                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/products-list/${product.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemName={product.name} id={product.id} deleteAction={deleteProduct} />
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
