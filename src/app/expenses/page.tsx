import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
import { Coins, Edit } from "lucide-react";
import Link from "next/link";
import { AddExpenseButton } from "./AddExpenseButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteExpense } from "../actions/expenses";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { FilterButton } from "@/components/FilterButton";
import { getSearchQuery, getSkipTake, getTotalPages, type RawSearchParams } from "@/lib/pagination";
import type { Prisma, ExpenseCategory } from "@/generated/prisma/client";

const categoryLabels: Record<string, string> = {
  INTERNAL: "داخلي",
  FACTORY: "مصنع",
  SUPPLIER: "مورد",
};

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));

const categoryColors: Record<string, string> = {
  INTERNAL: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300",
  FACTORY: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  SUPPLIER: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchQuery(params);
  const { skip, take, page, pageSize } = getSkipTake(params);
  const categoryFilter = typeof params.category === "string" ? params.category : "";
  const fromDate = typeof params.from === "string" ? params.from : "";
  const toDate = typeof params.to === "string" ? params.to : "";

  const where: Prisma.ExpenseWhereInput = {
    ...(q
      ? {
          OR: [
            { item: { contains: q, mode: "insensitive" } },
            { factory: { name: { contains: q, mode: "insensitive" } } },
            { supplier: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(categoryFilter ? { category: categoryFilter as ExpenseCategory } : {}),
    ...(fromDate || toDate
      ? {
          date: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? { lte: new Date(`${toDate}T23:59:59.999`) } : {}),
          },
        }
      : {}),
  };

  const [expenses, totalCount, factories, suppliers, byCategoryGroups] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take,
      include: { factory: true, supplier: true },
    }),
    prisma.expense.count({ where }),
    prisma.factory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    // ملخص الإجماليات دايمًا من كل السجلات (مش الصفحة المعروضة فقط) عشان يفضل صحيح ١٠٠٪
    prisma.expense.groupBy({ by: ["category"], _sum: { amount: true } }),
  ]);

  const byCategory = {
    INTERNAL: byCategoryGroups.find((g) => g.category === "INTERNAL")?._sum.amount ?? 0,
    FACTORY: byCategoryGroups.find((g) => g.category === "FACTORY")?._sum.amount ?? 0,
    SUPPLIER: byCategoryGroups.find((g) => g.category === "SUPPLIER")?._sum.amount ?? 0,
  };
  const total = byCategory.INTERNAL + byCategory.FACTORY + byCategory.SUPPLIER;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Coins className="w-8 h-8 text-[#12829b]" />
          المصروفات
        </h1>
        <AddExpenseButton factories={factories} suppliers={suppliers} />
      </div>

      {/* ملخص - دايمًا من كل السجلات، مش متأثر بالبحث أو التصفية تحت */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">إجمالي المصروفات</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatNumber(total)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">مصاريف داخلية</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(byCategory.INTERNAL)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">مدفوعات مصانع</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(byCategory.FACTORY)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">مدفوعات موردين</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(byCategory.SUPPLIER)}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchBar basePath="/expenses" defaultValue={q} placeholder="بحث بالوصف أو المصنع أو المورد..." />
          </div>
          <FilterButton
            title="تصفية المصروفات"
            basePath="/expenses"
            searchParams={params}
            fields={[
              { type: "select", name: "category", label: "التصنيف", options: categoryOptions },
              { type: "date", name: "from", label: "من تاريخ" },
              { type: "date", name: "to", label: "إلى تاريخ" },
            ]}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">التصنيف</th>
                <th className="px-4 py-3 text-xs">الوصف</th>
                <th className="px-4 py-3 text-xs">جهة الدفع</th>
                <th className="px-4 py-3 text-xs">المبلغ</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد مصروفات مسجلة. اضغط على "تسجيل مصروف" لإضافة مصروف جديد.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(e.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[e.category]}`}>
                        {categoryLabels[e.category] || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {e.item}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {e.factory?.name || e.supplier?.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600 text-sm">
                      {formatNumber(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/expenses/${e.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemName={e.item} id={e.id} deleteAction={deleteExpense} />
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
          basePath="/expenses"
        />
      </div>
    </div>
  );
}
