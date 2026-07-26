import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Users, Phone, MessageCircle, PhoneCall, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { AddClientButton } from "./AddClientButton";
import { DeleteClientButton } from "./DeleteClientButton";

export default async function ClientsListPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invoices: true,
      payments: true,
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{clients.length} عميل</p>
        <AddClientButton />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">الاسم</th>
                <th className="px-4 py-3 text-xs">الهاتف</th>
                <th className="px-4 py-3 text-xs">رصيد سابق</th>
                <th className="px-4 py-3 text-xs">الرصيد الحالي</th>
                <th className="px-4 py-3 text-xs">الحالة</th>
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

                  // Determine status
                  let status = 'حساب خالص';
                  let statusClass = 'bg-gray-100 text-gray-800 border-gray-200';
                  if (currentBalance > 0.01) {
                    status = 'لم يتم السداد';
                    statusClass = 'bg-red-100 text-red-800 border-red-200';
                  } else if (currentBalance < -0.01) {
                    status = 'مدفوعات زائدة';
                    statusClass = 'bg-green-100 text-green-800 border-green-200';
                  }

                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/clients-list/${client.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {client.phone && (
                            <a href={`tel:${client.phone}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="hover:text-[#12829b] text-sm" dir="ltr">
                              {client.phone}
                            </a>
                          )}
                          <div className="flex items-center gap-1">
                            {client.phone && (
                              <a href={`tel:${client.phone}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="text-gray-400 hover:text-[#12829b]">
                                <PhoneCall className="w-4 h-4" />
                              </a>
                            )}
                            {client.whatsapp && (
                              <a href={`https://wa.me/2${client.whatsapp}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {client.openingBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-sm">
                        {currentBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/clients-list/${client.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteClientButton clientId={client.id} />
                        </div>
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
