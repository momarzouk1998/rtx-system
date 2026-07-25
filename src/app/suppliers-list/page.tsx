import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { UserPlus, Phone, MessageCircle, PhoneCall } from "lucide-react";
import { AddSupplierButton } from "./AddSupplierButton";

export default async function SuppliersListPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      addMaterials: true,
      expenses: true,
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{suppliers.length} مورد</p>
        <AddSupplierButton />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد موردين مسجلين. اضغط على "إضافة مورد" لإضافة موردين جدد.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => {
                  const totalPurchases = supplier.addMaterials.reduce((sum, mat) => sum + mat.totalCost, 0);
                  const totalPayments = supplier.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const currentBalance = (totalPurchases - totalPayments) + supplier.openingBalance;

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
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{supplier.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {supplier.phone && (
                            <a href={`tel:${supplier.phone}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="hover:text-[#12829b] text-sm" dir="ltr">
                              {supplier.phone}
                            </a>
                          )}
                          <div className="flex items-center gap-1">
                            {supplier.phone && (
                              <a href={`tel:${supplier.phone}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="text-gray-400 hover:text-[#12829b]">
                                <PhoneCall className="w-4 h-4" />
                              </a>
                            )}
                            {supplier.whatsapp && (
                              <a href={`https://wa.me/2${supplier.whatsapp}`} onClick={(e: React.MouseEvent) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {supplier.openingBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-sm">
                        {currentBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${statusClass}`}>
                          {status}
                        </span>
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
