import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { ClipboardList } from "lucide-react";
import { StatusUpdater } from "./StatusUpdater";

type Status = "PROCESSING" | "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const statusLabels: Record<Status, string> = {
  PROCESSING: "قيد التشغيل",
  ORDERED: "تم الطلب",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "إلغاء الطلب",
};

export default async function OrdersTrackPage() {
  const invoices = await prisma.salesInvoice.findMany({
    orderBy: { date: "desc" },
    include: {
      client: true,
      items: true,
    },
  });

  // إحصائيات حسب الحالة
  const counts = {
    PROCESSING: invoices.filter((i) => i.status === "PROCESSING").length,
    ORDERED: invoices.filter((i) => i.status === "ORDERED").length,
    SHIPPED: invoices.filter((i) => i.status === "SHIPPED").length,
    DELIVERED: invoices.filter((i) => i.status === "DELIVERED").length,
    CANCELLED: invoices.filter((i) => i.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-[#12829b]" />
          متابعة الطلبات
        </h1>
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
                      {new Date(inv.date).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {inv.client?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {inv.items.length} صنف
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {inv.netTotal.toLocaleString("ar-EG")} ج.م
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
      </div>
    </div>
  );
}
