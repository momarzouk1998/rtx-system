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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#12829b]" />
            قائمة العملاء
          </h1>
          <p className="text-sm text-gray-500 mt-1">إدارة بيانات العملاء وحساباتهم</p>
        </div>
        <AddClientButton />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">اسم العميل</th>
                <th className="px-4 py-3 text-xs">التواصل</th>
                <th className="px-4 py-3 text-xs">إجمالي المسحوبات</th>
                <th className="px-4 py-3 text-xs">إجمالي المدفوعات</th>
                <th className="px-4 py-3 text-xs">الرصيد الحالي</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                        {client.address && <div className="text-xs text-gray-500 mt-1">{client.address}</div>}
                      </td>
                      <td className="px-4 py-3 space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a href={`tel:${client.phone}`} className="hover:text-[#12829b]" dir="ltr">{client.phone}</a>
                          </div>
                        )}
                        {client.whatsapp && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MessageCircle className="w-3 h-3 text-green-500" />
                            <a href={`https://wa.me/2${client.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-green-600" dir="ltr">{client.whatsapp}</a>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-medium text-sm">
                        {totalSales.toLocaleString()} ج.م
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium text-sm">
                        {totalPayments.toLocaleString()} ج.م
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          currentBalance > 0 ? 'bg-red-100 text-red-800 border-red-200' :
                          currentBalance < 0 ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {Math.abs(currentBalance).toLocaleString()} ج.م
                          <span className="mr-1">{currentBalance > 0 ? '(عليه)' : currentBalance < 0 ? '(له)' : ''}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link href={`/statement?client=${client.id}`} className="text-[#12829b] hover:text-[#0ea5e9] hover:underline text-xs">
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
