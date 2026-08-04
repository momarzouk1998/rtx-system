import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteProductionOrder } from "@/app/actions/production";
import { deleteExpense } from "@/app/actions/expenses";

export async function FactoryStatement({ factoryId }: { factoryId: string }) {
  const isAll = factoryId === "all";

  const factories = await prisma.factory.findMany();
  const factoryMap = new Map(factories.map((f) => [f.id, f]));

  const whereFactory = isAll ? {} : { factoryId };
  const whereExpense = isAll ? { category: "FACTORY" as any } : { factoryId, category: "FACTORY" as any };

  const [productionOrders, expenses] = await Promise.all([
    prisma.productionOrder.findMany({ 
      where: whereFactory, 
      include: { product: true }, 
      orderBy: { date: "asc" } 
    }),
    prisma.expense.findMany({ 
      where: whereExpense, 
      orderBy: { date: "asc" } 
    }),
  ]);

  // Combine into a single timeline
  const timeline: any[] = [];
  
  productionOrders.forEach((p) => {
    timeline.push({
      date: p.date,
      type: "PRODUCTION",
      id: p.id,
      factoryId: p.factoryId,
      factoryName: p.factoryId ? factoryMap.get(p.factoryId)?.name : "",
      description: `تشغيل: ${p.product.name}`,
      materialSentKg: p.quantityKg,
      productName: p.product.name,
      productReceivedKg: p.receivedQuantityKg || 0,
      bagsCount: p.packagedBags || 0,
      pricePerKg: p.operatingCost,
      commission: p.totalOperatingCost,
      payment: 0,
    });
  });

  expenses.forEach((e) => {
    timeline.push({
      date: e.date,
      type: "EXPENSE",
      id: e.id,
      factoryId: e.factoryId,
      factoryName: e.factoryId ? factoryMap.get(e.factoryId)?.name : "",
      description: e.item || "دفعة نقدية",
      materialSentKg: 0,
      productName: "",
      productReceivedKg: 0,
      bagsCount: 0,
      pricePerKg: 0,
      commission: 0,
      payment: e.amount,
    });
  });

  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate cumulatives per factory and per product
  let runningFinancialBalance = isAll ? factories.reduce((sum, f) => sum + f.openingBalance, 0) : (factoryMap.get(factoryId)?.openingBalance || 0);
  
  const productMaterialBalance: Record<string, number> = {};
  
  let totalMaterialSent = 0;
  let totalProductReceived = 0;

  const rows = timeline.map((row, index) => {
    runningFinancialBalance += row.commission - row.payment;
    
    let currentMaterialBalance = 0;
    if (row.type === "PRODUCTION" && row.productName) {
      if (!productMaterialBalance[row.productName]) {
        productMaterialBalance[row.productName] = 0;
      }
      productMaterialBalance[row.productName] += (row.materialSentKg || 0) - (row.productReceivedKg || 0);
      currentMaterialBalance = productMaterialBalance[row.productName];
    }
    
    totalMaterialSent += row.materialSentKg || 0;
    totalProductReceived += row.productReceivedKg || 0;

    return {
      ...row,
      receiptNo: index + 1,
      materialBalance: currentMaterialBalance,
      financialBalance: runningFinancialBalance,
    };
  });

  const currentDateFormatted = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const selectedFactoryName = isAll ? "تجميعي (جميع المصانع)" : (factoryMap.get(factoryId)?.name || "مصنع غير محدد");

  return (
    <div className="space-y-4 w-full">

      {/* Printable Corporate Container */}
      <div id="printable-factory-statement" className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 printable-statement-content w-full print:p-0 print:border-none">
        
        {/* Cyan Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-slate-900 rounded-full mb-4 print:rounded-none"></div>

        {/* Corporate Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-slate-950 p-2 rounded-xl border-2 border-sky-400/40 shadow-sm flex items-center justify-center print:border-slate-800">
                <img src="/rtx-logo.png" alt="RTX Logo" className="h-12 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  RTX للتجارة والتصنيع
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-0.5">كشف حساب تشغيل خارجي - مصنع</p>
              </div>
            </div>
            
            <div className="text-left">
              <div className="inline-block bg-gradient-to-r from-slate-900 to-[#0284c7] text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-xs print:bg-slate-900">
                كشف حساب مصنع
              </div>
              <p className="text-xs text-slate-600 font-bold mt-1.5">
                تاريخ الاستخراج: <span className="text-slate-900 dark:text-white font-extrabold">{currentDateFormatted}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Factory Name & Summary Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-sky-50 dark:bg-zinc-800/80 p-3.5 rounded-xl border border-sky-200 dark:border-zinc-700 flex flex-col justify-center print:bg-slate-50">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">اسم المصنع:</span>
            <span className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedFactoryName}</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 text-center print:bg-blue-50">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-0.5">📤 إجمالي خامات مرسلة</span>
            <span className="text-lg font-black text-blue-800 dark:text-blue-300">{(totalMaterialSent || 0).toLocaleString("ar-EG")} كجم</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center print:bg-emerald-50">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">📥 إجمالي منتج مستلم</span>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{(totalProductReceived || 0).toLocaleString("ar-EG")} كجم</span>
          </div>

          <div className="bg-gradient-to-r from-slate-900 via-[#0284c7] to-[#0369a1] text-white p-3.5 rounded-xl text-center shadow-md flex flex-col justify-center print:bg-slate-900 print:text-white">
            <span className="text-xs font-black text-white/90 block mb-0.5">💰 الرصيد المالي المستحق</span>
            <span className="text-xl font-black text-white">{(runningFinancialBalance || 0).toLocaleString("ar-EG")}</span>
          </div>
        </div>

        {/* Main Table - Optimized for Print & Landscape PDF */}
        <div className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-xs print:rounded-none print:border-slate-400 w-full">
          <table className="w-full text-center text-xs border-collapse" dir="rtl">
            <thead className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
              <tr className="divide-x divide-x-reverse divide-slate-800 print:divide-slate-400">
                <th className="py-2.5 px-1.5 font-black text-[11px] w-8">#</th>
                <th className="py-2.5 px-2 font-black text-[11px] w-20">التاريخ</th>
                {isAll && <th className="py-2.5 px-2 font-black text-[11px]">المصنع</th>}
                <th className="py-2.5 px-2 text-right font-black text-[11px] w-36">البيان</th>
                <th className="py-2.5 px-2 font-black text-[11px] bg-slate-950 text-blue-300 print:bg-slate-300 print:text-black w-24">تسليم خامات</th>
                <th className="py-2.5 px-2 font-black text-[11px] w-24">نوع الصنف</th>
                <th className="py-2.5 px-2 font-black text-[11px] bg-slate-950 text-emerald-300 print:bg-slate-300 print:text-black w-24">استلام منتج</th>
                <th className="py-2.5 px-1.5 font-black text-[11px] w-16">الأكياس</th>
                <th className="py-2.5 px-1.5 font-black text-[11px] w-16">السعر</th>
                <th className="py-2.5 px-2 font-black text-[11px] text-amber-300 print:text-black w-20">عمولة</th>
                <th className="py-2.5 px-2 font-black text-[11px] text-rose-300 print:text-black w-20">مسدد</th>
                <th className="py-2.5 px-2 font-black text-[11px] bg-slate-800 text-slate-200 print:bg-slate-300 print:text-black w-24">رصيد خامات</th>
                <th className="py-2.5 px-2 font-black text-[11px] bg-slate-800 text-slate-200 print:bg-slate-300 print:text-black w-24">رصيد مالي</th>
                <th className="py-2.5 px-2 font-black text-[11px] print:hidden w-12 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 print:divide-slate-300 text-[11px]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={isAll ? 14 : 13} className="py-8 text-center text-slate-400 font-bold">
                    لا توجد حركات تصنيع خارجي مسجلة
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.type + row.id} className="hover:bg-sky-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2 px-1 font-bold text-slate-600 dark:text-slate-400 text-center">{row.receiptNo}</td>
                    <td className="py-2 px-1.5 text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap text-center">
                      {new Date(row.date).toISOString().split("T")[0]}
                    </td>
                    {isAll && <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">{row.factoryName}</td>}
                    <td className="py-2 px-2 text-right font-extrabold text-slate-900 dark:text-white">
                      {row.description}
                    </td>
                    
                    {/* تسليم خامات */}
                    <td className="py-2 px-2 font-black bg-blue-50/30 dark:bg-blue-950/20 text-center">
                      {row.materialSentKg > 0 ? (
                        <span className="text-blue-700 dark:text-blue-400 print:text-black font-black">
                          {row.materialSentKg.toLocaleString("ar-EG")}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-2 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center">{row.productName || "—"}</td>
                    
                    {/* استلام منتج */}
                    <td className="py-2 px-2 font-black bg-emerald-50/30 dark:bg-emerald-950/20 text-center">
                      {row.productReceivedKg > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 print:text-black font-black">
                          {row.productReceivedKg.toLocaleString("ar-EG")}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-2 px-1.5 text-slate-700 dark:text-slate-300 font-bold text-center">
                      {row.bagsCount > 0 ? row.bagsCount.toLocaleString("ar-EG") : "—"}
                    </td>
                    
                    <td className="py-2 px-1.5 text-slate-700 dark:text-slate-300 font-bold text-center">
                      {row.pricePerKg > 0 ? row.pricePerKg.toLocaleString("ar-EG") : "—"}
                    </td>
                    
                    <td className="py-2 px-2 font-black text-amber-700 dark:text-amber-400 text-center">
                      {row.commission > 0 ? row.commission.toLocaleString("ar-EG") : "—"}
                    </td>

                    <td className="py-2 px-2 font-black text-rose-700 dark:text-rose-400 text-center">
                      {row.payment > 0 ? row.payment.toLocaleString("ar-EG") : "—"}
                    </td>

                    <td className="py-2 px-2 font-black bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-center">
                      {row.materialBalance.toLocaleString("ar-EG")}
                    </td>

                    <td className="py-2 px-2 font-black bg-slate-100 dark:bg-zinc-800 text-[#0284c7] dark:text-[#38bdf8] print:text-black text-center text-xs">
                      {row.financialBalance.toLocaleString("ar-EG")}
                    </td>

                    <td className="py-2 px-1 text-center print:hidden">
                      <DeleteButton
                        id={row.id}
                        itemName={row.description}
                        deleteAction={row.type === "PRODUCTION" ? deleteProductionOrder : deleteExpense}
                      />
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
