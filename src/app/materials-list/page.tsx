import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
import { Layers, Edit } from "lucide-react";
import Link from "next/link";
import { AddMaterialButton } from "./AddMaterialButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteMaterial } from "../actions/materials";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { getSearchQuery, getSkipTake, getTotalPages, type RawSearchParams } from "@/lib/pagination";
import type { Prisma } from "@/generated/prisma/client";

export default async function MaterialsListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchQuery(params);
  const { skip, take, page, pageSize } = getSkipTake(params);

  const where: Prisma.MaterialWhereInput = q
    ? { name: { contains: q, mode: "insensitive" } }
    : {};

  const [materials, totalCount] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      // Later we can include stock calculations here
    }),
    prisma.material.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{totalCount} خامة</p>
        <AddMaterialButton />
      </div>

      <div className="card">
        <SearchBar basePath="/materials-list" defaultValue={q} placeholder="بحث بالاسم..." />
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
                      {formatNumber(mat.price)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {formatNumber(mat.openingBalance)} كجم
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(mat.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/materials-list/${mat.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemName={mat.name} id={mat.id} deleteAction={deleteMaterial} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={getTotalPages(totalCount, pageSize)}
          totalCount={totalCount}
          pageSize={pageSize}
          searchParams={params}
          basePath="/materials-list"
        />
      </div>
    </div>
  );
}
