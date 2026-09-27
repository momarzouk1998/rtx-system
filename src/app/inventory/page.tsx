import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { Package, Box, ArrowUpRight, ArrowDownLeft, Warehouse, FileText } from "lucide-react";
import { AddTransactionModal } from "./AddTransactionModal";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteInventoryTransactionAction } from "../actions/inventory";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { FilterButton } from "@/components/FilterButton";
import { getSearchQuery, getSkipTake, getTotalPages, type RawSearchParams } from "@/lib/pagination";
import type { Prisma, TransactionType, TransactionReason } from "@/generated/prisma/client";

export const dynamic = 'force-dynamic';

const typeOptions = [
  { value: "IN", label: "وارد" },
  { value: "OUT", label: "منصرف" },
];

const reasonOptions = [
  { value: "PURCHASE", label: "شراء وتوريد (مورد)" },
  { value: "SALES", label: "مبيعات وخروج (عميل)" },
  { value: "PRODUCTION_MATERIAL_OUT", label: "منصرف للتشغيل بالتصنيع" },
  { value: "PRODUCTION_PRODUCT_IN", label: "وارد استلام منتج نهائي" },
  { value: "PACKAGING_IN", label: "وارد من التغليف" },
  { value: "PACKAGING_OUT", label: "منصرف للتغليف" },
  { value: "ADJUSTMENT", label: "تسوية وجرد مخزني" },
];

export default async function InventoryDashboard({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchQuery(params);
  const { skip, take, page, pageSize } = getSkipTake(params);
  const typeFilter = typeof params.type === "string" ? params.type : "";
  const reasonFilter = typeof params.reason === "string" ? params.reason : "";

  const where: Prisma.InventoryTransactionWhereInput = {
    ...(q
      ? {
          OR: [
            { material: { name: { contains: q, mode: "insensitive" } } },
            { product: { name: { contains: q, mode: "insensitive" } } },
            { notes: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(typeFilter ? { type: typeFilter as TransactionType } : {}),
    ...(reasonFilter ? { reason: reasonFilter as TransactionReason } : {}),
  };

  // Fetch materials/products (بدون كل الحركات - الأرصدة بتتحسب بالتجميع في الداتابيز تحت)
  // وسجل الحركات (مفلتر ومقسّم لصفحات للعرض فقط)، وعدد الحركات الكلي.
  const [
    materials,
    products,
    recentTransactions,
    ledgerTotalCount,
    allTransactionsCount,
    materialSums,
    productSums,
  ] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        material: true,
        product: true,
        createdBy: true,
      }
    }),
    prisma.inventoryTransaction.count({ where }),
    prisma.inventoryTransaction.count(),
    // مجموع الوارد/المنصرف لكل خامة - بديل رياضيًا مطابق لعملية الجمع اليدوية لكن بحساب الداتابيز
    prisma.inventoryTransaction.groupBy({
      by: ["materialId", "type"],
      where: { materialId: { not: null } },
      _sum: { quantity: true },
    }),
    prisma.inventoryTransaction.groupBy({
      by: ["productId", "type"],
      where: { productId: { not: null } },
      _sum: { quantity: true },
    }),
  ]);

  // Calculate balances
  let totalMaterialsKg = 0;
  let totalMaterialsValue = 0;
  let totalProductsBags = 0;
  let totalProductsValue = 0;

  const materialMovement = new Map<string, { in: number; out: number }>();
  for (const g of materialSums) {
    if (!g.materialId) continue;
    const entry = materialMovement.get(g.materialId) ?? { in: 0, out: 0 };
    if (g.type === "IN") entry.in += g._sum.quantity ?? 0;
    if (g.type === "OUT") entry.out += g._sum.quantity ?? 0;
    materialMovement.set(g.materialId, entry);
  }

  const productMovement = new Map<string, { in: number; out: number }>();
  for (const g of productSums) {
    if (!g.productId) continue;
    const entry = productMovement.get(g.productId) ?? { in: 0, out: 0 };
    if (g.type === "IN") entry.in += g._sum.quantity ?? 0;
    if (g.type === "OUT") entry.out += g._sum.quantity ?? 0;
    productMovement.set(g.productId, entry);
  }

  const materialBalances = materials.map((mat) => {
    const movement = materialMovement.get(mat.id) ?? { in: 0, out: 0 };
    const balance = mat.openingBalance + movement.in - movement.out;
    const totalVal = balance * mat.price;
    totalMaterialsKg += balance;
    totalMaterialsValue += totalVal;
    return { ...mat, balance, totalVal };
  });

  const productBalances = products.map((prod) => {
    const movement = productMovement.get(prod.id) ?? { in: 0, out: 0 };
    const balance = prod.openingBalanceBags + movement.in - movement.out;
    const totalVal = balance * prod.bagPrice;
    totalProductsBags += balance;
    totalProductsValue += totalVal;
    return { ...prod, balance, totalVal };
  });

  const getReasonLabel = (reason: string, type: string) => {
    switch (reason) {
      case "PURCHASE": return "شراء وتوريد (مورد)";
      case "SALES": return "مبيعات وخروج (عميل)";
      case "PRODUCTION_MATERIAL_OUT": return "منصرف للتشغيل بالتصنيع";
      case "PRODUCTION_PRODUCT_IN": return "وارد استلام منتج نهائي";
      case "PACKAGING_IN": return "وارد من التغليف";
      case "PACKAGING_OUT": return "منصرف للتغليف";
      case "ADJUSTMENT": return "تسوية وجرد مخزني";
      default: return type === "IN" ? "وارد مخزني" : "منصرف مخزني";
    }
  };

  const materialOptions = materials.map(m => ({ id: m.id, name: m.name }));
  const productOptions = products.map(p => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Title & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center">
              <Warehouse className="w-6 h-6" />
            </div>
            إدارة المخازن وحركة المخزون
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            سجل حركة الوارد والمنصرف والتسويات المخزنية للمواد الخام والمنتجات
          </p>
        </div>
        <div>
          <AddTransactionModal materials={materialOptions} products={productOptions} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Stat 1: Raw Materials Stock */}
        <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">رصيد المواد الخام (كجم)</span>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <Box className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNumber(totalMaterialsKg)} كجم</p>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
              القيمة الإجمالية: {formatNumber(totalMaterialsValue)}
            </p>
          </div>
        </div>

        {/* Stat 2: Finished Products Stock */}
        <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">رصيد المنتجات (أكياس)</span>
            <div className="p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
              <Package className="h-6 w-6 text-[#0284c7] dark:text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNumber(totalProductsBags)} كيس</p>
            <p className="text-xs font-bold text-[#0284c7] dark:text-sky-400 mt-1">
              القيمة البيعية المتوقعة: {formatNumber(totalProductsValue)}
            </p>
          </div>
        </div>

        {/* Stat 3: Total Movements Recorded */}
        <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">إجمالي الحركات المسجلة</span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{allTransactionsCount} حركة</p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              سجل تفصيلي دائم للوارد والمنصرف
            </p>
          </div>
        </div>

      </div>

      {/* Movement Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284c7]" />
            سجل حركات المخزن التفصيلي (الوارد والمنصرف والتسويات)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar basePath="/inventory" defaultValue={q} placeholder="بحث بالصنف أو الملاحظات..." />
            <FilterButton
              title="تصفية حركات المخزن"
              basePath="/inventory"
              searchParams={params}
              fields={[
                { type: "select", name: "type", label: "نوع الحركة", options: typeOptions },
                { type: "select", name: "reason", label: "السبب", options: reasonOptions },
              ]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm" dir="rtl">
            <thead className="bg-slate-900 text-white text-xs">
              <tr>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">الفئة</th>
                <th className="px-4 py-3 font-bold">اسم الصنف</th>
                <th className="px-4 py-3 font-bold">نوع الحركة</th>
                <th className="px-4 py-3 font-bold">البيان والسبب</th>
                <th className="px-4 py-3 font-bold">الكمية</th>
                <th className="px-4 py-3 font-bold">ملاحظات</th>
                <th className="px-4 py-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-medium">
                    لا توجد حركات مخزنية مسجلة بعد.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(t.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500">
                      {t.material ? "خامة" : "منتج جاهز"}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      {t.material ? t.material.name : t.product?.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        t.type === "IN" 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200" 
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                      }`}>
                        {t.type === "IN" ? <ArrowDownLeft className="w-3.5 h-3.5"/> : <ArrowUpRight className="w-3.5 h-3.5"/>}
                        {t.type === "IN" ? "وارد" : "منصرف"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {getReasonLabel(t.reason, t.type)}
                    </td>
                    <td className={`px-4 py-3 font-black text-base ${t.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "IN" ? "+" : "-"}{formatNumber(t.quantity)} {t.material ? "كجم" : "كيس"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {t.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DeleteButton
                        id={t.id}
                        itemName={`حركة ${t.type === "IN" ? "وارد" : "منصرف"} (${t.material ? t.material.name : t.product?.name})`}
                        deleteAction={deleteInventoryTransactionAction}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={getTotalPages(ledgerTotalCount, pageSize)}
          totalCount={ledgerTotalCount}
          pageSize={pageSize}
          searchParams={params}
          basePath="/inventory"
        />
      </div>

      {/* Stock Balances Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Raw Materials Balances */}
        <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">أرصدة المواد الخام الحالية (كجم)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm" dir="rtl">
              <thead className="bg-slate-900 text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">اسم الخامة</th>
                  <th className="px-4 py-3 font-bold">الرصيد الصافي</th>
                  <th className="px-4 py-3 font-bold">القيمة المتوقعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {materialBalances.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-slate-400">لا توجد خامات مسجلة</td></tr>
                ) : materialBalances.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{mat.name}</td>
                    <td className="px-4 py-3 text-[#0284c7] font-black">{formatNumber(mat.balance)} كجم</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">{formatNumber(mat.totalVal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Balances */}
        <div className="bg-white dark:bg-zinc-900 shadow-xs border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">أرصدة المنتجات الحالية (أكياس)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm" dir="rtl">
              <thead className="bg-slate-900 text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">اسم المنتج</th>
                  <th className="px-4 py-3 font-bold">رصيد الأكياس</th>
                  <th className="px-4 py-3 font-bold">القيمة البيعية المتوقعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {productBalances.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-slate-400">لا توجد منتجات مسجلة</td></tr>
                ) : productBalances.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{prod.name}</td>
                    <td className="px-4 py-3 text-emerald-600 font-black">{formatNumber(prod.balance)} كيس</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">{formatNumber(prod.totalVal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
