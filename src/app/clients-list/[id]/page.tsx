import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Edit, FileText, Phone, MessageCircle, PhoneCall, MapPin } from "lucide-react";
import { deleteClient } from "../../actions/clients";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { date: "desc" },
        include: {
          items: true
        }
      },
      payments: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!client) {
    notFound();
  }

  // Calculate balances
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/clients-list" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة العملاء
        </Link>
        <div className="flex gap-2">
          <Link href={`/statement?client=${client.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium">
            <FileText className="w-4 h-4" />
            كشف حساب
          </Link>
          <Link href={`/clients-list/${client.id}/edit`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-sm font-medium">
            <Edit className="w-4 h-4" />
            تعديل
          </Link>
          <DeleteButton variant="labeled" itemName={client.name} id={client.id} deleteAction={deleteClient} />
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">معلومات العميل</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">الاسم</label>
                <p className="font-medium text-gray-900">{client.name}</p>
              </div>
              {client.address && (
                <div>
                  <label className="text-xs text-gray-500">العنوان</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {client.address}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500">الهاتف</label>
                <div className="flex items-center gap-2">
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="font-medium text-[#12829b] hover:underline flex items-center gap-2" dir="ltr">
                      <PhoneCall className="w-4 h-4" />
                      {client.phone}
                    </a>
                  )}
                  {client.whatsapp && (
                    <a href={`https://wa.me/2${client.whatsapp}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">الحساب</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">الرصيد السابق</label>
                <p className="font-medium text-gray-900">{client.openingBalance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">إجمالي المسحوبات</label>
                <p className="font-medium text-gray-900">{totalSales.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">إجمالي المدفوعات</label>
                <p className="font-medium text-gray-900">{totalPayments.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">الرصيد الحالي</label>
                <p className="font-bold text-xl text-gray-900">{currentBalance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">الحالة</label>
                <span className={`badge text-xs ${statusClass}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">آخر الفواتير</h2>
        {client.invoices.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد فواتير</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead className="table-header border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-xs">التاريخ</th>
                  <th className="px-4 py-3 text-xs">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 text-sm">#{invoice.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-3 text-sm font-medium">{invoice.netTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">آخر المدفوعات</h2>
        {client.payments.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد مدفوعات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead className="table-header border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs">التاريخ</th>
                  <th className="px-4 py-3 text-xs">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.payments.slice(0, 5).map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm">{new Date(payment.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payment.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
