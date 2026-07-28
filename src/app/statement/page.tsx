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
        type: "فاتورة",
        description: `طلب #${i.orderNumber}`,
        entityName: isAll ? i.client?.name : "",
        debit: i.netTotal, // عليه
        credit: 0,
      }));

      const payMoves = payments.map((p) => ({
        date: p.date,
        type: "دفعة",
        description: p.notes || "سداد",
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
      // Logic for factory is now inside FactoryStatement component. 
      // This is just to satisfy the previous flow before the component renders.
    }

    movements.sort((a, b) => a.date.getTime() - b.date.getTime());
    const debit = movements.reduce((s, m) => s + m.debit, 0);
    const credit = movements.reduce((s, m) => s + m.credit, 0);
    
    // For clients: Debit means they owe us (positive balance means they owe us)
    // For suppliers/factories: Credit means we owe them (positive balance means we owe them)
    // Let's standardize: 
    // Clients: Balance = Opening + Debit - Credit
    // Suppliers/Factories: Balance = Opening + Credit - Debit
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#12829b]" />
          كشف حساب
        </h1>
        {selectedEntity && <PrintButton />}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800 pb-px no-print">
        <Link href="?type=client" className={`pb-2 px-4 font-medium text-sm transition-colors border-b-2 ${type === "client" ? "border-[#12829b] text-[#12829b]" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} flex items-center gap-2`}>
          <Users className="w-4 h-4" /> العملاء
        </Link>
        <Link href="?type=supplier" className={`pb-2 px-4 font-medium text-sm transition-colors border-b-2 ${type === "supplier" ? "border-[#12829b] text-[#12829b]" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} flex items-center gap-2`}>
          <Truck className="w-4 h-4" /> الموردين
        </Link>
        <Link href="?type=factory" className={`pb-2 px-4 font-medium text-sm transition-colors border-b-2 ${type === "factory" ? "border-[#12829b] text-[#12829b]" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} flex items-center gap-2`}>
          <FactoryIcon className="w-4 h-4" /> المصانع
        </Link>
      </div>

      {/* اختيار الحساب */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 no-print">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          اختر {getTypeLabel()} لعرض كشف الحساب
        </label>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/statement?type=${type}&id=all`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedId === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            }`}
          >
            كشف مجمع (الكل)
          </Link>
          {activeList.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              لا يوجد حسابات مسجلة هنا بعد.
            </p>
          ) : (
            activeList.map((c) => (
              <Link
                key={c.id}
                href={`/statement?type=${type}&id=${c.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedId === c.id
                    ? "bg-[#12829b] text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                {c.name}
              </Link>
            ))
          )}
        </div>
      </div>

      {!selectedEntity ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            اختر حساباً من الأعلى لعرض كشف الحساب التفصيلي.
          </p>
        </div>
      ) : (
        <>
          {type === "factory" ? (
            <FactoryStatement factoryId={selectedId!} />
          ) : (
            <>
          {/* رأس كشف الحساب */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">كشف حساب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  RTX للتجارة والتصنيع
                </p>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500 dark:text-gray-400">{getTypeLabel()}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedEntity.name}</div>
              </div>
            </div>

            {/* ملخص */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">رصيد افتتاحي</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">{totals.opening.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">{type === "client" ? "إجمالي عليه (مدين)" : "إجمالي المسدد (عليه)"}</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">{totals.debit.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">{type === "client" ? "إجمالي له (دائن)" : "إجمالي المستحق له (دائن)"}</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{totals.credit.toLocaleString("ar-EG")}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">الرصيد الحالي</div>
                <div className={`text-lg font-bold mt-1 ${totals.balance >= 0 ? "text-[#12829b]" : "text-green-600"}`}>
                  {totals.balance.toLocaleString("ar-EG")}
                </div>
              </div>
            </div>
          </div>

          {/* جدول الحركات */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                    {isAll && <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الاسم</th>}
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">النوع</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">البيان</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">عليه (مدين)</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">له (دائن)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        لا توجد حركات على هذا الحساب.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {movements.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(m.date).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                          </td>
                          {isAll && <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">{m.entityName}</td>}
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                              {m.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{m.description}</td>
                          <td className="px-6 py-3 font-medium text-red-600 dark:text-red-400">
                            {m.debit > 0 ? m.debit.toLocaleString("ar-EG") : "—"}
                          </td>
                          <td className="px-6 py-3 font-medium text-green-600 dark:text-green-400">
                            {m.credit > 0 ? m.credit.toLocaleString("ar-EG") : "—"}
                          </td>
                        </tr>
                      ))}
                      {/* صف الرصيد النهائي */}
                      <tr className="bg-gray-50 dark:bg-zinc-800/50 font-bold">
                        <td colSpan={isAll ? 4 : 3} className="px-6 py-4 text-gray-900 dark:text-white">الرصيد الحالي</td>
                        <td colSpan={2} className="px-6 py-4 text-[#12829b]">
                          {totals.balance.toLocaleString("ar-EG")}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
