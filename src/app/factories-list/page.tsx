import { prisma } from "@/lib/prisma";
import { Factory, Phone, MessageCircle } from "lucide-react";
import { AddFactoryButton } from "./AddFactoryButton";

export default async function FactoriesListPage() {
  const factories = await prisma.factory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      productionOrders: true,
      expenses: true,
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Factory className="w-8 h-8 text-[#12829b]" />
          قائمة المصانع (التشغيل الخارجي)
        </h1>
        <AddFactoryButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">اسم المصنع</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التواصل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي تكلفة التشغيل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي المدفوعات</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الرصيد الحالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {factories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا يوجد مصانع مسجلة. اضغط على "إضافة مصنع" لإضافة مصانع جديدة.
                  </td>
                </tr>
              ) : (
                factories.map((factory) => {
                  const totalProduction = factory.productionOrders.reduce((sum, order) => sum + order.totalOperatingCost, 0);
                  const totalPayments = factory.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                  const currentBalance = (totalProduction - totalPayments) + factory.openingBalance;

                  return (
                    <tr key={factory.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{factory.name}</div>
                        {factory.address && <div className="text-sm text-gray-500 mt-1">{factory.address}</div>}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        {factory.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${factory.phone}`} className="hover:text-[#12829b]" dir="ltr">{factory.phone}</a>
                          </div>
                        )}
                        {factory.whatsapp && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <a href={`https://wa.me/2${factory.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-green-600" dir="ltr">{factory.whatsapp}</a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                        {totalProduction.toLocaleString()} ج.م
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
                          <span className="mr-1">{currentBalance > 0 ? '(له)' : currentBalance < 0 ? '(عليه)' : ''}</span>
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
