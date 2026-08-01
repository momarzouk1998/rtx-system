import { prisma } from "@/lib/prisma";

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
  
  // Track material balance per product name
  const productMaterialBalance: Record<string, number> = {};
  
  let totalMaterialSent = 0;
  let totalProductReceived = 0;
  let totalCommission = 0;
  let totalPayments = 0;

  const rows = timeline.map((row, index) => {
    // Financial balance
    runningFinancialBalance += row.commission - row.payment;
    
    // Material balance per product
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
    totalCommission += row.commission || 0;
    totalPayments += row.payment || 0;

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

  return (
    <div className="space-y-6">
      
      {/* Corporate Printable Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-6 print:border-none print:p-0">
        
        {/* Cyan Accent Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-slate-900 rounded-full mb-3 print:rounded-none"></div>

        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 p-2.5 rounded-2xl border-2 border-sky-400/40 shadow-md flex items-center justify-center print:border-slate-800">
              <img src="/rtx-logo.png" alt="RTX Logo" className="h-14 w-auto object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                RTX للتجارة والتصنيع
              </h2>
            </div>
          </div>
          <div className="text-left">
            <div className="inline-block bg-gradient-to-r from-slate-900 to-[#0284c7] text-white px-5 py-2 rounded-xl text-xs font-black print:bg-slate-900 print:text-white print:border print:border-black">
              كشف حساب مصنع
            </div>
            <p className="text-xs text-slate-500 font-bold mt-2">تاريخ الاستخراج: <span>{currentDateFormatted}</span></p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">اسم المصنع:</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {isAll ? "تجميعي (جميع المصانع)" : factoryMap.get(factoryId)?.name}
            </h3>
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-sky-50/50 dark:bg-zinc-800/50 rounded-xl border border-sky-200/80 dark:border-zinc-700 text-sm print:bg-slate-50 print:border-slate-300">
          <div className="text-center p-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي خامات مرسلة</div>
            <div className="text-base font-extrabold text-[#0284c7] dark:text-[#38bdf8] mt-1">
              {(totalMaterialSent || 0).toLocaleString("ar-EG")} كجم
            </div>
          </div>
          <div className="text-center p-2 border-r border-sky-200 dark:border-zinc-700 print:border-slate-300">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي منتج مستلم</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {(totalProductReceived || 0).toLocaleString("ar-EG")} كجم
            </div>
          </div>
          <div className="text-center p-2 border-r border-sky-200 dark:border-zinc-700 print:border-slate-300">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">الرصيد المالي المستحق (للمصنع)</div>
            <div className={`text-base font-black mt-1 ${runningFinancialBalance >= 0 ? "text-[#0284c7] dark:text-[#38bdf8]" : "text-rose-600"}`}>
              {(runningFinancialBalance || 0).toLocaleString("ar-EG")} ج.م
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 overflow-hidden print:border-slate-400 print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs" dir="rtl">
            <thead className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
              <tr>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">#</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">التاريخ</th>
                {isAll && <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">المصنع</th>}
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">البيان</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold bg-slate-950 text-[#38bdf8] print:bg-slate-300 print:text-black">تسليم خامات (كجم)</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">نوع الصنف</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold bg-slate-950 text-emerald-300 print:bg-slate-300 print:text-black">استلام منتج (كجم)</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">عدد الأكياس</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold">سعر التصنيع</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold text-amber-300 print:text-amber-700">عمولة مستحقة</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold text-rose-300 print:text-rose-700">دفعات مسددة</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold bg-slate-800 text-slate-200 print:bg-slate-300 print:text-black">رصيد الخامات</th>
                <th className="px-2.5 py-3 border-b border-slate-800 print:border-slate-400 font-bold bg-slate-800 text-slate-200 print:bg-slate-300 print:text-black">الرصيد المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 print:divide-slate-300">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={isAll ? 13 : 12} className="px-6 py-10 text-center text-slate-400 font-medium">
                    لا توجد حركات تصنيع خارجي
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.type + row.id} className="hover:bg-sky-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-2.5 py-2.5 font-bold text-slate-600 dark:text-slate-400">{row.receiptNo}</td>
                    <td className="px-2.5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(row.date).toISOString().split("T")[0]}
                    </td>
                    {isAll && <td className="px-2.5 py-2.5 font-bold text-slate-900 dark:text-white">{row.factoryName}</td>}
                    <td className="px-2.5 py-2.5 text-right font-medium text-slate-900 dark:text-white">{row.description}</td>
                    <td className="px-2.5 py-2.5 font-extrabold text-[#0284c7] dark:text-[#38bdf8]">
                      {row.materialSentKg > 0 ? row.materialSentKg.toLocaleString("ar-EG") : ""}
                    </td>
                    <td className="px-2.5 py-2.5 font-medium text-slate-700 dark:text-slate-300">{row.productName}</td>
                    <td className="px-2.5 py-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {row.productReceivedKg > 0 ? row.productReceivedKg.toLocaleString("ar-EG") : ""}
                    </td>
                    <td className="px-2.5 py-2.5 text-slate-700 dark:text-slate-300">
                      {row.bagsCount > 0 ? row.bagsCount.toLocaleString("ar-EG") : ""}
                    </td>
                    <td className="px-2.5 py-2.5 text-slate-700 dark:text-slate-300">
                      {row.pricePerKg > 0 ? row.pricePerKg.toLocaleString("ar-EG") : ""}
                    </td>
                    <td className="px-2.5 py-2.5 font-bold text-amber-600 dark:text-amber-400">
                      {row.commission > 0 ? `${row.commission.toLocaleString("ar-EG")} ج.م` : ""}
                    </td>
                    <td className="px-2.5 py-2.5 font-bold text-rose-600 dark:text-rose-400">
                      {row.payment > 0 ? `${row.payment.toLocaleString("ar-EG")} ج.م` : ""}
                    </td>
                    <td className="px-2.5 py-2.5 font-extrabold bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-white">
                      {row.materialBalance.toLocaleString("ar-EG")} كجم
                    </td>
                    <td className="px-2.5 py-2.5 font-black bg-slate-50 dark:bg-zinc-800/80 text-[#0284c7] dark:text-[#38bdf8] print:text-black">
                      {row.financialBalance.toLocaleString("ar-EG")} ج.م
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Signatures & Approval Footer */}
      <div className="hidden print:grid grid-cols-3 gap-6 pt-12 text-center text-xs font-bold text-slate-800 border-t border-slate-300 mt-8">
        <div>
          <p className="mb-8">مسؤول التشغيل بالمصنع</p>
          <p className="border-t border-dashed border-slate-400 pt-1">................................</p>
        </div>
        <div>
          <p className="mb-8">توقيع واعتماد المحاسب</p>
          <p className="border-t border-dashed border-slate-400 pt-1">................................</p>
        </div>
        <div>
          <p className="mb-8">ختم إدارة RTX</p>
          <p className="border-t border-dashed border-slate-400 pt-1">................................</p>
        </div>
      </div>

    </div>
  );
}
