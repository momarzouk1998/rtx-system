import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Banknote } from "lucide-react";
import { AddPaymentButton } from "./AddPaymentButton";

const methodLabels: Record<string, string> = {
  CASH: "نقدي",
  WALLET: "محفظة",
  INSTAPAY: "إنستاباي",
  BANK_TRANSFER: "تحويل بنكي",
};

const typeLabels: Record<string, string> = {
  DEBT_PAYMENT: "سداد مديونية",
  REFUND: "إرجاع",
  DEPOSIT: "تأمين",
  ON_ACCOUNT: "تحت الحساب",
  OTHER: "أخرى",
};

export default async function PaymentsPage() {
  const [payments, clients] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { date: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Banknote className="w-8 h-8 text-[#12829b]" />
          المدفوعات
        </h1>
        <AddPaymentButton clients={clients} />
      </div>

      {/* ملخص */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">إجمالي المدفوعات</div>
          <div className="text-2xl font-bold text-[#12829b] mt-1">{total.toLocaleString("ar-EG")}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">عدد الدفعات</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{payments.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5">
          <div className="text-sm text-gray-500 dark:text-gray-400">عدد العملاء</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {new Set(payments.map((p) => p.clientId)).size}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">طريقة الدفع</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">النوع</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا توجد دفعات مسجلة. اضغط على &quot;تسجيل دفعة&quot; لإضافة دفعة جديدة.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(p.date).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {p.client?.name || "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      {p.amount.toLocaleString("ar-EG")}                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {p.method ? methodLabels[p.method] || p.method : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#12829b]/10 text-[#12829b]">
                        {typeLabels[p.paymentType] || p.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {p.notes || "—"}
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
