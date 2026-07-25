import { prisma } from "@/lib/prisma";
import { ShoppingCart, Calendar } from "lucide-react";
import { AddInvoiceButton } from "./AddInvoiceButton";

export default async function SalesStagePage() {
  const invoices = await prisma.salesInvoice.findMany({
    orderBy: { date: "desc" },
    include: {
      client: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, bagPrice: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#12829b]" />
          مرحلة البيع (الطلبات)
        </h1>
        <AddInvoiceButton clients={clients} products={products} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الفاتورة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">حالة الطلب</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الإجمالي (قبل الخصم)</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الصافي</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا يوجد فواتير مبيعات حتى الآن. اضغط على "فاتورة جديدة" للبدء.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      #{invoice.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(invoice.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#12829b]">{invoice.client.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        invoice.status === 'ORDERED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        invoice.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        invoice.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {invoice.status === 'PROCESSING' && 'قيد التشغيل'}
                        {invoice.status === 'ORDERED' && 'تم الطلب'}
                        {invoice.status === 'SHIPPED' && 'تم الشحن'}
                        {invoice.status === 'DELIVERED' && 'تم التسليم'}
                        {invoice.status === 'CANCELLED' && 'ملغي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 line-through decoration-gray-300">
                      {invoice.subTotal.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {invoice.netTotal.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button className="text-[#12829b] hover:text-[#0e687c] hover:underline bg-blue-50 dark:bg-[#12829b]/10 px-3 py-1.5 rounded-md transition-colors">
                        عرض التفاصيل
                      </button>
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
