import { prisma } from "@/lib/prisma";
import { Package, Box, ArrowUpRight, ArrowDownRight, RefreshCw, PlusCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InventoryDashboard() {
  // Fetch materials and products
  const [materials, products, recentTransactions] = await Promise.all([
    prisma.material.findMany({
      include: {
        transactions: true,
      }
    }),
    prisma.product.findMany({
      include: {
        transactions: true,
      }
    }),
    prisma.inventoryTransaction.findMany({
      take: 20,
      orderBy: { date: 'desc' },
      include: {
        material: true,
        product: true,
      }
    })
  ]);

  // Calculate stats
  let totalMaterialsKg = 0;
  let totalProductsBags = 0;

  const materialBalances = materials.map((mat) => {
    let balance = mat.openingBalance;
    mat.transactions.forEach(t => {
      if (t.type === "IN") balance += t.quantity;
      if (t.type === "OUT") balance -= t.quantity;
    });
    totalMaterialsKg += balance;
    return { ...mat, balance };
  });

  const productBalances = products.map((prod) => {
    let balance = prod.openingBalanceBags;
    prod.transactions.forEach(t => {
      if (t.type === "IN") balance += t.quantity;
      if (t.type === "OUT") balance -= t.quantity;
    });
    totalProductsBags += balance;
    return { ...prod, balance };
  });

  const getReasonLabel = (reason: string, type: string) => {
    switch (reason) {
      case "PURCHASE": return "شراء (مورد)";
      case "SALES": return "مبيعات (عميل)";
      case "PRODUCTION_MATERIAL_OUT": return "منصرف تصنيع";
      case "PRODUCTION_PRODUCT_IN": return "استلام منتج";
      case "ADJUSTMENT": return "تسوية";
      default: return type === "IN" ? "وارد" : "منصرف";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#38bdf8]">إدارة المخازن</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">حركة المواد الخام والمنتجات النهائية الفعلية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stat 1 */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="w-24 h-24 text-amber-500" />
          </div>
          <div className="relative z-10 flex items-center">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <Box className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="mr-4 text-sm font-medium text-gray-600 dark:text-gray-400 truncate">إجمالي المواد الخام المتوفرة</p>
          </div>
          <div className="relative z-10 mt-4 flex items-baseline pb-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalMaterialsKg.toLocaleString()} Kg</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative z-10 flex items-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <Package className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="mr-4 text-sm font-medium text-gray-600 dark:text-gray-400 truncate">رصيد الأكياس (منتج نهائي)</p>
          </div>
          <div className="relative z-10 mt-4 flex items-baseline pb-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalProductsBags.toLocaleString()} كيس</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Raw Materials */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-[#38bdf8]">رصيد المواد الخام (كجم)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-600 dark:text-gray-400" dir="rtl">
              <thead className="text-xs text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">الخامة</th>
                  <th className="px-4 py-3">الرصيد الحالي</th>
                  <th className="px-4 py-3 rounded-tl-lg">التكلفة المتوقعة (السعر × الكمية)</th>
                </tr>
              </thead>
              <tbody>
                {materialBalances.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4">لا يوجد بيانات</td></tr>
                ) : materialBalances.map(mat => (
                  <tr key={mat.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{mat.name}</td>
                    <td className="px-4 py-3 text-[#12829b] font-bold">{mat.balance.toLocaleString()} Kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{(mat.balance * mat.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-[#38bdf8]">رصيد المنتجات (أكياس)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-600 dark:text-gray-400" dir="rtl">
              <thead className="text-xs text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">المنتج</th>
                  <th className="px-4 py-3">رصيد الأكياس</th>
                  <th className="px-4 py-3 rounded-tl-lg">القيمة البيعية المتوقعة</th>
                </tr>
              </thead>
              <tbody>
                {productBalances.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4">لا يوجد بيانات</td></tr>
                ) : productBalances.map(prod => (
                  <tr key={prod.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{prod.name}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{prod.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{(prod.balance * prod.bagPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-[#38bdf8] mb-6">أحدث حركات المخزن</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-600 dark:text-gray-400" dir="rtl">
            <thead className="text-xs text-gray-500 dark:text-gray-300 uppercase bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">الصنف</th>
                <th className="px-4 py-3">العملية</th>
                <th className="px-4 py-3">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8">لا يوجد حركات</td></tr>
              ) : recentTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">{t.date.toISOString().split("T")[0]}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {t.material ? t.material.name : t.product?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      t.type === "IN" 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}>
                      {t.type === "IN" ? <ArrowDownRight className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
                      {getReasonLabel(t.reason, t.type)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-bold ${t.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {t.type === "IN" ? "+" : "-"}{t.quantity.toLocaleString()} {t.material ? "Kg" : "كيس"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
