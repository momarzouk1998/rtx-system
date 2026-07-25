import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { FileText, Printer } from "lucide-react";
import Link from "next/link";

export default async function StatementPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const params = await searchParams;
  const selectedClientId = params.client;

  const [clients] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, name: true, openingBalance: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  // لو فيه عميل محدد، هات فواتيره ومدفوعاته
  let movements: Array<{ date: Date; type: string; description: string; debit: number; credit: number }> = [];
  let totals = { opening: 0, debit: 0, credit: 0, balance: 0 };

  if (selectedClient) {
    const [invoices, payments] = await Promise.all([
      prisma.salesInvoice.findMany({
        where: { clientId: selectedClient.id },
        orderBy: { date: "asc" },
      }),
      prisma.payment.findMany({
        where: { clientId: selectedClient.id },
        orderBy: { date: "asc" },
      }),
    ]);

    const opening = selectedClient.openingBalance;

    const invMoves = invoices
      .filter((i) => i.status !== "CANCELLED")
      .map((i) => ({
        date: i.date,
        type: "فاتورة",
        description: `طلب #${i.orderNumber}`,
        debit: i.netTotal, // عليه (مدين)
        credit: 0,
      }));

    const payMoves = payments.map((p) => ({
      date: p.date,
      type: "دفعة",
      description: p.notes || "سداد",
      debit: 0,
      credit: p.amount, // له (دائن)
    }));

    movements = [...invMoves, ...payMoves].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const debit = movements.reduce((s, m) => s + m.debit, 0);
    const credit = movements.reduce((s, m) => s + m.credit, 0);
    totals = { opening, debit, credit, balance: opening + debit - credit };
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#12829b]" />
          كشف حساب
        </h1>
        {selectedClient && (
          <button
            onClick={() => window.print()}
            className="bg-[#12829b] hover:bg-[#0e687c] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            طباعة
          </button>
        )}
      </div>

      {/* اختيار العميل */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 no-print">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          اختر العميل لعرض كشف الحساب
        </label>
        <div className="flex flex-wrap gap-2">
          {clients.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              لا يوجد عملاء مسجلين بعد.
            </p>
          ) : (
            clients.map((c) => (
              <Link
                key={c.id}
                href={`/statement?client=${c.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClientId === c.id
                    ? "bg-[#12829b] text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                {c.name}
              </Link>
            ))
          )}
        </div>
      </div>

      {!selectedClient ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            اختر عميلاً من الأعلى لعرض كشف حسابه التفصيلي.
          </p>
        </div>
      ) : (
        <>
          {/* رأس كشف الحساب */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">كشف حساب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  RTX للتجارة والتصنيع
                </p>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500 dark:text-gray-400">العميل</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedClient.name}</div>
              </div>
            </div>

            {/* ملخص */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">رصيد افتتاحي</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">{totals.opening.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي عليه (مدين)</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">{totals.debit.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي له (دائن)</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{totals.credit.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">الرصيد الحالي</div>
                <div className={`text-lg font-bold mt-1 ${totals.balance >= 0 ? "text-[#12829b]" : "text-green-600"}`}>
                  {totals.balance.toLocaleString("ar-EG")}                </div>
              </div>
            </div>
          </div>

          {/* جدول الحركات */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">النوع</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">البيان</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">عليه (مدين)</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">له (دائن)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد حركات على هذا العميل.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {movements.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(m.date).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              m.type === "فاتورة"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{m.description}</td>
                          <td className="px-6 py-3 font-medium text-red-600 dark:text-red-400">
                            {m.debit > 0 ? m.debit.toLocaleString("ar-EG") : "—"}
                          </td>
                          <td className="px-6 py-3 font-medium text-green-600 dark:text-green-400">
                            {m.credit > 0 ? m.credit.toLocaleString("ar-EG") : "—"}
                          </td>
                        </tr>
                      ))}
                      {/* صف الرصيد النهائي */}
                      <tr className="bg-gray-50 dark:bg-zinc-800/50 font-bold">
                        <td colSpan={3} className="px-6 py-4 text-gray-900 dark:text-white">الرصيد الحالي</td>
                        <td colSpan={2} className="px-6 py-4 text-[#12829b]">
                          {totals.balance.toLocaleString("ar-EG")}                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
