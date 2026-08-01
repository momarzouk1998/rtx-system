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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      {/* Header (Screen mode) */}
      <div className="flex items-center justify-between no-print flex-wrap gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-2 rounded-xl border border-sky-400/40 shadow-xs flex items-center justify-center">
            <img src="/rtx-logo.png" alt="RTX Logo" className="h-9 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              كشف حساب تفصيلي
            </h1>
            <p className="text-xs text-[#0ea5e9] dark:text-[#38bdf8] font-bold mt-0.5">
              نظام استخراج كشوف الحسابات المعتمدة لشركة RTX
            </p>
          </div>
        </div>
        {selectedEntity && <PrintButton />}
      </div>

      {/* Tabs (Screen mode) */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-px no-print">
        <Link href="?type=client" className={`pb-3 px-5 font-bold text-sm transition-all border-b-2 ${type === "client" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-2 rounded-t-lg`}>
          <Users className="w-4 h-4" /> كشوف العملاء
        </Link>
        <Link href="?type=supplier" className={`pb-3 px-5 font-bold text-sm transition-all border-b-2 ${type === "supplier" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-2 rounded-t-lg`}>
          <Truck className="w-4 h-4" /> كشوف الموردين
        </Link>
        <Link href="?type=factory" className={`pb-3 px-5 font-bold text-sm transition-all border-b-2 ${type === "factory" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-2 rounded-t-lg`}>
          <FactoryIcon className="w-4 h-4" /> كشوف المصانع
        </Link>
      </div>

      {/* Account Picker Pills (Screen mode) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 no-print">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          اختر {getTypeLabel()} لعرض الحركات:
        </label>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/statement?type=${type}&id=all`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedId === "all"
                ? "bg-[#0ea5e9] text-white shadow-xs"
                : "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40"
            }`}
          >
            كشف مجمع (الكل)
          </Link>
          {activeList.length === 0 ? (
            <p className="text-slate-400 text-xs py-2">
              لا توجد حسابات مسجلة هنا بعد.
            </p>
          ) : (
            activeList.map((c) => (
              <Link
                key={c.id}
                href={`/statement?type=${type}&id=${c.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-16 text-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">اختر حساباً لعرض الكشف</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            قم باختيار {type === "client" ? "عميل" : type === "supplier" ? "مورد" : "مصنع"} من القائمة أعلاه لعرض التفاصيل
          </p>
        </div>
      ) : (
        <>
          {type === "factory" && selectedId ? (
            <FactoryStatement factoryId={selectedId} />
          ) : (
            <div className="space-y-6">
              
              {/* Official Corporate Statement Header with RTX Branding & Logo */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-6 print:border-none print:p-0">
                
                {/* Cyan Accent Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-slate-900 rounded-full mb-3 print:rounded-none"></div>

                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                  
                  {/* Logo Container & Company Title */}
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
                      كشف حساب {getTypeLabel()}
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-2">تاريخ الاستخراج: <span>{currentDateFormatted}</span></p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">اسم الحساب:</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{selectedEntity.name}</h3>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">فئة الكشف:</span>
                    <span className="text-sm font-black text-[#0ea5e9]">{getTypeLabel()}</span>
                  </div>
                </div>

                {/* Financial KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-sky-50/50 dark:bg-zinc-800/50 rounded-xl border border-sky-200/80 dark:border-zinc-700 text-sm print:bg-slate-50 print:border-slate-300">
                  <div className="text-center p-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">رصيد افتتاحي</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      {(totals.opening || 0).toLocaleString("ar-EG")}
                    </div>
                  </div>
                  <div className="text-center p-2 border-r border-sky-200 dark:border-zinc-700 print:border-slate-300">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {type === "client" ? "إجمالي عليه (مدين)" : "إجمالي المسدد (عليه)"}
                    </div>
                    <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                      {(totals.debit || 0).toLocaleString("ar-EG")}
                    </div>
                  </div>
                  <div className="text-center p-2 border-r border-sky-200 dark:border-zinc-700 print:border-slate-300">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {type === "client" ? "إجمالي له (دائن)" : "إجمالي المستحق له (دائن)"}
                    </div>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {(totals.credit || 0).toLocaleString("ar-EG")}
                    </div>
                  </div>
                  <div className="text-center p-2 border-r border-sky-200 dark:border-zinc-700 print:border-slate-300">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">الرصيد الحالي المستحق</div>
                    <div className={`text-base font-black mt-1 ${totals.balance >= 0 ? "text-[#0284c7] dark:text-[#38bdf8]" : "text-emerald-600"}`}>
                      {(totals.balance || 0).toLocaleString("ar-EG")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 overflow-hidden print:border-slate-400 print:rounded-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm" dir="rtl">
                    <thead className="bg-slate-900 text-white text-xs print:bg-slate-200 print:text-black">
                      <tr>
                        <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold">التاريخ</th>
                        {isAll && <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold">الاسم</th>}
                        <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold">نوع الحركة</th>
                        <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold">البيان والتفاصيل</th>
                        <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold text-rose-300 print:text-rose-700">عليه (مدين)</th>
                        <th className="px-5 py-3.5 border-b border-slate-800 print:border-slate-400 font-bold text-[#38bdf8] print:text-emerald-700">له (دائن)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 print:divide-slate-300">
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan={isAll ? 6 : 5} className="px-6 py-10 text-center text-slate-400 font-medium">
                            لا توجد حركات مسجلة على هذا الحساب.
                          </td>
                        </tr>
                      ) : (
                        <>
                          {movements.map((m, idx) => (
                            <tr key={idx} className="hover:bg-sky-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                              <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                                {new Date(m.date).toISOString().split("T")[0]}
                              </td>
                              {isAll && <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{m.entityName}</td>}
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 dark:bg-zinc-800 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-zinc-700">
                                  {m.type}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-900 dark:text-slate-100 font-medium">{m.description}</td>
                              <td className="px-5 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                                {m.debit > 0 ? `${m.debit.toLocaleString("ar-EG")}` : "—"}
                              </td>
                              <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                                {m.credit > 0 ? `${m.credit.toLocaleString("ar-EG")}` : "—"}
                              </td>
                            </tr>
                          ))}
                          {/* Total Balance Summary Row */}
                          <tr className="bg-sky-50/60 dark:bg-zinc-800/80 font-black text-sm print:bg-slate-200">
                            <td colSpan={isAll ? 4 : 3} className="px-5 py-4 text-slate-900 dark:text-white">الرصيد المستحق النهائي</td>
                            <td colSpan={2} className="px-5 py-4 text-[#0284c7] dark:text-[#38bdf8] print:text-black text-base font-black">
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
