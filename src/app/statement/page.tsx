import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { FileText, Users, Factory as FactoryIcon, Truck } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { FactoryStatement } from "./FactoryStatement";

export default async function StatementPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const params = await searchParams;
  const type = params.type || "client"; // client, supplier, factory
  const selectedId = params.id;

  // Fetch all lists for tabs
  const [clients, suppliers, factories] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true, openingBalance: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ select: { id: true, name: true, openingBalance: true }, orderBy: { name: "asc" } }),
    prisma.factory.findMany({ select: { id: true, name: true, openingBalance: true }, orderBy: { name: "asc" } }),
  ]);

  let activeList = clients;
  if (type === "supplier") activeList = suppliers;
  if (type === "factory") activeList = factories;

  const isAll = selectedId === "all";
  const selectedEntity = isAll 
    ? { id: "all", name: "كشف مجمع (الكل)", openingBalance: activeList.reduce((s, c) => s + c.openingBalance, 0) } 
    : (selectedId ? activeList.find((c) => c.id === selectedId) : null);

  let movements: Array<{ date: Date; type: string; description: string; debit: number; credit: number; entityName?: string }> = [];
  let totals = { opening: 0, debit: 0, credit: 0, balance: 0 };

  if (selectedEntity) {
    totals.opening = selectedEntity.openingBalance;

    if (type === "client") {
      const whereCondition = isAll ? {} : { clientId: selectedEntity.id };
      const [invoices, payments] = await Promise.all([
        prisma.salesInvoice.findMany({ where: whereCondition, orderBy: { date: "asc" }, include: { client: true } }),
        prisma.payment.findMany({ where: whereCondition, orderBy: { date: "asc" }, include: { client: true } }),
      ]);

      const invMoves = invoices.filter((i) => i.status !== "CANCELLED").map((i) => ({
        date: i.date,
        type: "فاتورة مبيعات",
        description: `طلب رقم #${i.orderNumber}`,
        entityName: isAll ? i.client?.name : "",
        debit: i.netTotal, // عليه
        credit: 0,
      }));

      const payMoves = payments.map((p) => ({
        date: p.date,
        type: "دفعة نقدية",
        description: p.notes || "سداد حساب",
        entityName: isAll ? p.client?.name : "",
        debit: 0,
        credit: p.amount, // له
      }));

      movements = [...invMoves, ...payMoves];
    } else if (type === "supplier") {
      const whereCondition = isAll ? {} : { supplierId: selectedEntity.id };
      const [addMaterials, expenses] = await Promise.all([
        prisma.addMaterial.findMany({ where: whereCondition, include: { material: true, supplier: true }, orderBy: { date: "asc" } }),
        prisma.expense.findMany({ where: whereCondition, include: { supplier: true }, orderBy: { date: "asc" } }),
      ]);

      const matMoves = addMaterials.map((m) => ({
        date: m.date,
        type: "توريد خامات",
        description: `${m.quantityKg} كجم - ${m.material.name}`,
        entityName: isAll ? m.supplier?.name : "",
        debit: 0,
        credit: m.totalCost, // له (لأننا اشترينا منه فبقى دائن)
      }));

      const expMoves = expenses.map((e) => ({
        date: e.date,
        type: "دفعة مسددة",
        description: e.item || "دفعة نقدية",
        entityName: isAll ? e.supplier?.name : "",
        debit: e.amount, // عليه (خد فلوس)
        credit: 0,
      }));

      movements = [...matMoves, ...expMoves];
    } else if (type === "factory") {
      // Factory logic is handled inside FactoryStatement component
    }

    movements.sort((a, b) => a.date.getTime() - b.date.getTime());
    const debit = movements.reduce((s, m) => s + m.debit, 0);
    const credit = movements.reduce((s, m) => s + m.credit, 0);
    
    if (type === "client") {
      totals.balance = totals.opening + debit - credit;
    } else {
      totals.balance = totals.opening + credit - debit;
    }
    
    totals.debit = debit;
    totals.credit = credit;
  }

  const getTypeLabel = () => {
    if (type === "supplier") return "المورد";
    if (type === "factory") return "المصنع";
    return "العميل";
  };

  const currentDateFormatted = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      {/* Header (Screen mode) - Compact */}
      <div className="flex items-center justify-between no-print flex-wrap gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-sky-400/40 shadow-xs">
            <img src="/rtx-logo.png" alt="RTX Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              كشف حساب تفصيلي
            </h1>
            <p className="text-xs text-[#0ea5e9] dark:text-[#38bdf8] font-bold">
              نظام كشوف الحسابات - RTX
            </p>
          </div>
        </div>
        {selectedEntity && <PrintButton />}
      </div>

      {/* Tabs (Screen mode) - Compact */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-px no-print bg-white dark:bg-zinc-900 px-3 pt-3 rounded-t-xl">
        <Link href="?type=client" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "client" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <Users className="w-3.5 h-3.5" /> كشوف العملاء
        </Link>
        <Link href="?type=supplier" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "supplier" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <Truck className="w-3.5 h-3.5" /> كشوف الموردين
        </Link>
        <Link href="?type=factory" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "factory" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <FactoryIcon className="w-3.5 h-3.5" /> كشوف المصانع
        </Link>
      </div>

      {/* Account Picker Pills (Screen mode) - Compact */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 p-3 no-print">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          اختر {getTypeLabel()}:
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/statement?type=${type}&id=all`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedId === "all"
                ? "bg-[#0ea5e9] text-white shadow-xs"
                : "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40"
            }`}
          >
            كشف مجمع (الكل)
          </Link>
          {activeList.length === 0 ? (
            <p className="text-slate-400 text-xs py-1.5">
              لا توجد حسابات مسجلة.
            </p>
          ) : (
            activeList.map((c) => (
              <Link
                key={c.id}
                href={`/statement?type=${type}&id=${c.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedId === c.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                {c.name}
              </Link>
            ))
          )}
        </div>
      </div>

      {!selectedEntity ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">اختر حساباً</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            اختر {type === "client" ? "عميل" : type === "supplier" ? "مورد" : "مصنع"} لعرض الكشف
          </p>
        </div>
      ) : (
        <>
          {type === "factory" && selectedId ? (
            <FactoryStatement factoryId={selectedId} />
          ) : (
            <div className="space-y-4">
              
              {/* Official Corporate Statement Header - Compact Version */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 print:border-none print:shadow-none print:rounded-none">
                
                {/* Cyan Accent Top Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-slate-900 print:rounded-none"></div>

                {/* Header Section - Compact */}
                <div className="p-4 print:p-3">
                  <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-3">
                    
                    {/* Logo & Company Title - Smaller */}
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-950 p-1.5 rounded-xl border border-sky-400/40 print:border-slate-800">
                        <img src="/rtx-logo.png" alt="RTX Logo" className="h-10 w-auto object-contain" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                          RTX للتجارة والتصنيع
                        </h2>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="inline-block bg-gradient-to-r from-slate-900 to-[#0284c7] text-white px-4 py-1.5 rounded-lg text-xs font-black print:bg-slate-900">
                        كشف حساب {getTypeLabel()}
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        تاريخ الاستخراج: <span className="text-slate-900 dark:text-white">{currentDateFormatted}</span>
                      </p>
                    </div>
                  </div>

                  {/* Account Name - Inline */}
                  <div className="mb-3 bg-sky-50/50 dark:bg-zinc-800/50 p-3 rounded-lg print:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">اسم الحساب: </span>
                        <span className="text-base font-black text-slate-900 dark:text-white">{selectedEntity.name}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الفئة: </span>
                        <span className="text-sm font-black text-[#0ea5e9]">{getTypeLabel()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary - Compact Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {/* رصيد افتتاحي */}
                    <div className="bg-slate-100 dark:bg-zinc-800 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-center print:bg-slate-100">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">رصيد افتتاحي</div>
                      <div className="text-base font-black text-slate-900 dark:text-white print:text-slate-900">
                        {(totals.opening || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>

                    {/* إجمالي عليه (مدين) */}
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800 text-center print:bg-rose-50">
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                        {type === "client" ? "عليه (مدين)" : "المسدد"}
                      </div>
                      <div className="text-base font-black text-rose-700 dark:text-rose-400 print:text-rose-700">
                        {(totals.debit || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>

                    {/* إجمالي له (دائن) */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-center print:bg-emerald-50">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                        {type === "client" ? "له (دائن)" : "المستحق له"}
                      </div>
                      <div className="text-base font-black text-emerald-700 dark:text-emerald-400 print:text-emerald-700">
                        {(totals.credit || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>

                    {/* الرصيد الحالي */}
                    <div className="bg-gradient-to-br from-[#0284c7] to-[#0369a1] p-2.5 rounded-lg border border-[#0369a1] text-center print:bg-[#0284c7]">
                      <div className="text-xs font-bold text-white mb-1">الرصيد المستحق</div>
                      <div className="text-base font-black text-white">
                        {(totals.balance || 0).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Table - Integrated */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm" dir="rtl">
                    <thead className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white text-xs print:bg-[#0284c7]">
                      <tr>
                        <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold">التاريخ</th>
                        {isAll && <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold">الاسم</th>}
                        <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold">نوع الحركة</th>
                        <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold">البيان والتفاصيل</th>
                        <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold bg-white/10">عليه (مدين)</th>
                        <th className="px-3 py-2.5 border-b border-[#0369a1] print:border-slate-400 font-bold bg-white/10">له (دائن)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 print:divide-slate-300">
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan={isAll ? 6 : 5} className="px-6 py-8 text-center text-slate-400 font-medium">
                            لا توجد حركات مسجلة على هذا الحساب.
                          </td>
                        </tr>
                      ) : (
                        <>
                          {movements.map((m, idx) => (
                            <tr key={idx} className="hover:bg-sky-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                              <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                                {new Date(m.date).toISOString().split("T")[0]}
                              </td>
                              {isAll && <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white text-sm">{m.entityName}</td>}
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-sky-50 dark:bg-zinc-800 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-zinc-700">
                                  {m.type}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium text-sm">{m.description}</td>
                              {/* تمييز عمود المدين */}
                              <td className="px-3 py-2.5 font-black text-rose-700 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20 print:bg-rose-50/50 print:text-rose-700 text-sm">
                                {m.debit > 0 ? `${m.debit.toLocaleString("ar-EG")}` : "—"}
                              </td>
                              {/* تمييز عمود الدائن */}
                              <td className="px-3 py-2.5 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 print:bg-emerald-50/50 print:text-emerald-700 text-sm">
                                {m.credit > 0 ? `${m.credit.toLocaleString("ar-EG")}` : "—"}
                              </td>
                            </tr>
                          ))}
                          {/* Total Balance Summary Row */}
                          <tr className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white font-black print:bg-[#0284c7]">
                            <td colSpan={isAll ? 4 : 3} className="px-3 py-3 text-sm">الرصيد المستحق النهائي</td>
                            <td colSpan={2} className="px-3 py-3 text-white text-base font-black">
                              {(totals.balance || 0).toLocaleString("ar-EG")}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
