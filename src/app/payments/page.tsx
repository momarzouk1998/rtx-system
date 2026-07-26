import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Banknote, Edit } from "lucide-react";
import Link from "next/link";
import { AddPaymentButton } from "./AddPaymentButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deletePayment } from "../actions/payments";

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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">العميل</th>
                <th className="px-4 py-3 text-xs">المبلغ</th>
                <th className="px-4 py-3 text-xs">طريقة الدفع</th>
                <th className="px-4 py-3 text-xs">النوع</th>
                <th className="px-4 py-3 text-xs">ملاحظات</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد دفعات مسجلة. اضغط على "تسجيل دفعة" لإضافة دفعة جديدة.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(p.date).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {p.client?.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600 text-sm">
                      {p.amount.toLocaleString("ar-EG")}                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {p.method ? methodLabels[p.method] || p.method : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#12829b]/10 text-[#12829b]">
                        {typeLabels[p.paymentType] || p.paymentType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.notes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/payments/${p.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={p.id} deleteAction={deletePayment} />
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
