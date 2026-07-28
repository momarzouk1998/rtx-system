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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">كشف حساب التصنيع الخارجي</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isAll ? "تجميعي لجميع المصانع" : factoryMap.get(factoryId)?.name}
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">إجمالي خامات مرسلة</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">{totalMaterialSent.toLocaleString()} كجم</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">إجمالي منتج مستلم</div>
            <div className="font-bold text-lg text-emerald-600">{totalProductReceived.toLocaleString()} كجم</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">الرصيد المالي (للمصنع)</div>
            <div className={`font-bold text-lg ${runningFinancialBalance >= 0 ? "text-[#12829b]" : "text-red-500"}`}>
              {runningFinancialBalance.toLocaleString()} ج.م
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-sm" dir="rtl">
          <thead className="bg-[#1e293b] text-white">
            <tr>
              <th className="px-3 py-3 border border-slate-600">رقم الإذن</th>
              <th className="px-3 py-3 border border-slate-600">التاريخ</th>
              {isAll && <th className="px-3 py-3 border border-slate-600">اسم المصنع</th>}
              <th className="px-3 py-3 border border-slate-600">البيان</th>
              <th className="px-3 py-3 border border-slate-600 bg-blue-900/50">تسليم خامات (كجم)</th>
              <th className="px-3 py-3 border border-slate-600">نوع الصنف</th>
              <th className="px-3 py-3 border border-slate-600 bg-emerald-900/50">استلام منتج (كجم)</th>
              <th className="px-3 py-3 border border-slate-600">الكمية (أكياس)</th>
              <th className="px-3 py-3 border border-slate-600">سعر التصنيع</th>
              <th className="px-3 py-3 border border-slate-600 text-orange-200">عمولة مستحقة</th>
              <th className="px-3 py-3 border border-slate-600 text-red-200">دفعات مسددة</th>
              <th className="px-3 py-3 border border-slate-600 bg-slate-700">رصيد الخامات</th>
              <th className="px-3 py-3 border border-slate-600 bg-slate-700">الرصيد المالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={isAll ? 13 : 12} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  لا توجد حركات تصنيع خارجي
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.type + row.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-medium">{row.receiptNo}</td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-300">
                    {new Date(row.date).toISOString().split("T")[0]}
                  </td>
                  {isAll && <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-bold">{row.factoryName}</td>}
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 text-right">{row.description}</td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-bold text-blue-600 dark:text-blue-400">
                    {row.materialSentKg > 0 ? row.materialSentKg : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800">{row.productName}</td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-bold text-emerald-600 dark:text-emerald-400">
                    {row.productReceivedKg > 0 ? row.productReceivedKg : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800">
                    {row.bagsCount > 0 ? row.bagsCount.toLocaleString() : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800">
                    {row.pricePerKg > 0 ? row.pricePerKg : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-medium text-orange-600 dark:text-orange-400">
                    {row.commission > 0 ? row.commission.toLocaleString() : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 font-medium text-red-600 dark:text-red-400">
                    {row.payment > 0 ? row.payment.toLocaleString() : ""}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 font-bold">
                    {row.materialBalance.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/80 font-bold text-[#12829b]">
                    {row.financialBalance.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
