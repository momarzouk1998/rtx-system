import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
import { ClipboardList } from "lucide-react";
import { StatusUpdater } from "./StatusUpdater";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { FilterButton } from "@/components/FilterButton";
import { getSearchQuery, getSkipTake, getTotalPages, type RawSearchParams } from "@/lib/pagination";
import type { Prisma, OrderStatus } from "@/generated/prisma/client";

type Status = "PROCESSING" | "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const statusLabels: Record<Status, string> = {
  PROCESSING: "قيد التشغيل",
  ORDERED: "تم الطلب",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "إلغاء الطلب",
};

const statusOptions = (Object.keys(statusLabels) as Status[]).map((value) => ({
  value,
  label: statusLabels[value],
}));

export default async function OrdersTrackPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchQuery(params);
  const { skip, take, page, pageSize } = getSkipTake(params);
  const statusFilter = typeof params.status === "string" ? params.status : "";

  const asNumber = q && /^\d+$/.test(q) ? parseInt(q, 10) : undefined;
  const where: Prisma.SalesInvoiceWhereInput = {
    ...(q
      ? {
          OR: [
            { client: { name: { contains: q, mode: "insensitive" } } },
            ...(asNumber !== undefined ? [{ orderNumber: asNumber }] : []),
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter as OrderStatus } : {}),
  };

  const [invoices, totalCount, statusGroups] = await Promise.all([
    prisma.salesInvoice.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take,
      include: {
        client: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.salesInvoice.count({ where }),
    // إحصائيات الحالة دايمًا من كل الطلبات (مش الصفحة المعروضة فقط) عشان تفضل صحيحة ١٠٠٪
    prisma.salesInvoice.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts: Record<Status, number> = {
    PROCESSING: statusGroups.find((g) => g.status === "PROCESSING")?._count ?? 0,
    ORDERED: statusGroups.find((g) => g.status === "ORDERED")?._count ?? 0,
    SHIPPED: statusGroups.find((g) => g.status === "SHIPPED")?._count ?? 0,
    DELIVERED: statusGroups.find((g) => g.status === "DELIVERED")?._count ?? 0,
    CANCELLED: statusGroups.find((g) => g.status === "CANCELLED")?._count ?? 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-[#12829b]" />
          متابعة الطلبات
        </h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchBar basePath="/orders-track" defaultValue={q} placeholder="بحث برقم الطلب أو اسم العميل..." />
          </div>
          <FilterButton
            title="تصفية الطلبات"
            basePath="/orders-track"
            searchParams={params}
            fields={[{ type: "select", name: "status", label: "الحالة", options: statusOptions }]}
          />
        </div>
      </div>

      {/* إحصائيات الحالات */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {(["PROCESSING", "ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"] as Status[]).map((s) => (
          <div key={s} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{counts[s]}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{statusLabels[s]}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الطلب</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">عدد الأصناف</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الإجمالي</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا توجد طلبات بعد. يتم إنشاء الطلبات من صفحة &quot;مرحلة البيع&quot;.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#12829b]">#{inv.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(inv.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {inv.client?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {inv._count.items} صنف
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {formatNumber(inv.netTotal)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusUpdater invoiceId={inv.id} current={inv.status as Status} />
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
          basePath="/orders-track"
        />
      </div>
    </div>
  );
}
