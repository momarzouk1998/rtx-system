import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
import { ShoppingCart, Calendar, Edit } from "lucide-react";
import Link from "next/link";
import { AddInvoiceButton } from "./AddInvoiceButton";
import { InvoiceDetailsModal } from "./InvoiceDetailsModal";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteInvoice } from "../actions/sales";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { FilterButton } from "@/components/FilterButton";
import { getSearchQuery, getSkipTake, getTotalPages, type RawSearchParams } from "@/lib/pagination";
import type { Prisma, OrderStatus } from "@/generated/prisma/client";

const statusOptions = [
  { value: "PROCESSING", label: "قيد التشغيل" },
  { value: "ORDERED", label: "تم الطلب" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "ملغي" },
];

export default async function SalesStagePage({
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

  const [invoices, totalCount, clients, products] = await Promise.all([
    prisma.salesInvoice.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take,
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.salesInvoice.count({ where }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.product.findMany({
      select: { id: true, name: true, bagPrice: true },
      orderBy: { name: "asc" }
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{totalCount} فاتورة</p>
        <AddInvoiceButton clients={clients} products={products} />
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchBar basePath="/sales-stage" defaultValue={q} placeholder="بحث برقم الفاتورة أو اسم العميل..." />
          </div>
          <FilterButton
            title="تصفية الفواتير"
            basePath="/sales-stage"
            searchParams={params}
            fields={[{ type: "select", name: "status", label: "الحالة", options: statusOptions }]}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="table-header border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs">رقم الفاتورة</th>
                <th className="px-4 py-3 text-xs">التاريخ</th>
                <th className="px-4 py-3 text-xs">العميل</th>
                <th className="px-4 py-3 text-xs">الحالة</th>
                <th className="px-4 py-3 text-xs">الإجمالي</th>
                <th className="px-4 py-3 text-xs">الصافي</th>
                <th className="px-4 py-3 text-xs">التفاصيل</th>
                <th className="px-4 py-3 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد فواتير مبيعات حتى الآن. اضغط على "فاتورة جديدة" للبدء.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 text-sm">
                      #{invoice.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(invoice.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#12829b] text-sm">{invoice.client.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${
                        invoice.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        invoice.status === 'ORDERED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        invoice.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        invoice.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {invoice.status === 'PROCESSING' && 'قيد التشغيل'}
                        {invoice.status === 'ORDERED' && 'تم الطلب'}
                        {invoice.status === 'SHIPPED' && 'تم الشحن'}
                        {invoice.status === 'DELIVERED' && 'تم التسليم'}
                        {invoice.status === 'CANCELLED' && 'ملغي'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm line-through decoration-gray-300">
                      {formatNumber(invoice.subTotal)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-bold text-sm">
                      {formatNumber(invoice.netTotal)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <InvoiceDetailsModal invoice={invoice} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/sales-stage/${invoice.id}/edit`} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton itemName={`فاتورة #${invoice.orderNumber}`} warning="سيتم حذف الفاتورة وكل بنودها نهائياً." id={invoice.id} deleteAction={deleteInvoice} />
                      </div>
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
          basePath="/sales-stage"
        />
      </div>
    </div>
  );
}
