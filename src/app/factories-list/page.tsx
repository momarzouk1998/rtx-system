import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Factory, Phone, MessageCircle, PhoneCall, Edit } from "lucide-react";
import Link from "next/link";
import { AddFactoryButton } from "./AddFactoryButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteFactory } from "../actions/partners";

export default async function FactoriesListPage() {
  const factories = await prisma.factory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      productionOrders: true,
      expenses: true,
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{factories.length} مصنع</p>
        <AddFactoryButton />
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
              {factories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد مصانع مسجلة. اضغط على "إضافة مصنع" لإضافة مصانع جديدة.
                  </td>
                </tr>
              ) : (
                factories.map((factory) => {
                  const totalProduction = factory.productionOrders.reduce((sum, order) => sum + order.totalOperatingCost, 0);
                  const totalPayments = factory.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const currentBalance = (totalProduction - totalPayments) + factory.openingBalance;

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
                    <tr key={factory.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{factory.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {factory.phone && (
                            <a href={`tel:${factory.phone}`} className="hover:text-[#12829b] text-sm" dir="ltr">
                              {factory.phone}
                            </a>
                          )}
                          <div className="flex items-center gap-1">
                            {factory.phone && (
                              <a href={`tel:${factory.phone}`} className="text-gray-400 hover:text-[#12829b]">
                                <PhoneCall className="w-4 h-4" />
                              </a>
                            )}
                            {factory.whatsapp && (
                              <a href={`https://wa.me/2${factory.whatsapp}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {factory.openingBalance.toLocaleString()}
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
                          <Link href={`/factories-list/${factory.id}/edit`} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteButton itemName={factory.name} id={factory.id} deleteAction={deleteFactory} />
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
