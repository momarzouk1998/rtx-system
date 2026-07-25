import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Users, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { AddClientButton } from "./AddClientButton";

export default async function ClientsListPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invoices: true,
      payments: true,
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-[#12829b]" />
          قائمة العملاء
        </h1>
        <AddClientButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">اسم العميل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التواصل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي المسحوبات</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي المدفوعات</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الرصيد الحالي</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا يوجد عملاء مسجلين. اضغط على "إضافة عميل" لإضافة عملاء جدد.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  // Calculate balance dynamically
                  const totalSales = client.invoices.reduce((sum, inv) => sum + (inv.status !== 'CANCELLED' ? inv.netTotal : 0), 0);
                  const totalPayments = client.payments.reduce((sum, pay) => sum + pay.amount, 0);
                  const currentBalance = (totalSales - totalPayments) + client.openingBalance;

                  return (
                    <tr key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                        {client.address && <div className="text-sm text-gray-500 mt-1">{client.address}</div>}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${client.phone}`} className="hover:text-[#12829b]" dir="ltr">{client.phone}</a>
                          </div>
                        )}
                        {client.whatsapp && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <a href={`https://wa.me/2${client.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-green-600" dir="ltr">{client.whatsapp}</a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                        {totalSales.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-medium">
                        {totalPayments.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          currentBalance > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          currentBalance < 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {Math.abs(currentBalance).toLocaleString()} ج.م
                          <span className="mr-1">{currentBalance > 0 ? '(عليه)' : currentBalance < 0 ? '(له)' : ''}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link href={`/statement?client=${client.id}`} className="text-[#12829b] hover:text-[#0e687c] hover:underline">
                          كشف حساب
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
