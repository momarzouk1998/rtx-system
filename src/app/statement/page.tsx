import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { FileText, Users, Factory as FactoryIcon, Truck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { FactoryStatement } from "./FactoryStatement";
import { StatementPrintTemplate } from "./StatementPrintTemplate";

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
    ? { id: "all", name: `كشف مجمع شامل لكل ${type === "client" ? "العملاء" : type === "supplier" ? "الموردين" : "المصانع"}`, openingBalance: activeList.reduce((s, c) => s + c.openingBalance, 0) } 
    : (selectedId ? activeList.find((c) => c.id === selectedId) : null);

  let movements: Array<{ date: Date; type: string; description: string; debit: number; credit: number; entityName?: string }> = [];
  let summaryRows: Array<{ id: string; name: string; createdAt: Date; openingBalance: number; statusLabel: string; statusColor: string; totalInvoices: number; totalPayments: number; netBalance: number }> = [];
  let totals = { opening: 0, debit: 0, credit: 0, balance: 0 };

  if (selectedEntity) {
    totals.opening = selectedEntity.openingBalance;

    if (isAll) {
      if (type === "client") {
        const clientsWithData = await prisma.client.findMany({
          orderBy: { name: "asc" },
          include: {
            invoices: { where: { status: { not: "CANCELLED" } }, select: { netTotal: true } },
            payments: { select: { amount: true } }
          }
        });

        summaryRows = clientsWithData.map((c) => {
          const totalInvoices = c.invoices.reduce((sum, inv) => sum + inv.netTotal, 0);
          const totalPayments = c.payments.reduce((sum, pay) => sum + pay.amount, 0);
          const netBalance = c.openingBalance + totalInvoices - totalPayments;
          
          let statusLabel = "خالص";
          let statusColor = "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300";
          if (netBalance > 0) { statusLabel = "عليه ديون"; statusColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"; } 
          else if (netBalance < 0) { statusLabel = "له مستحقات"; statusColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"; }

          return { id: c.id, name: c.name, createdAt: c.createdAt as any, openingBalance: c.openingBalance, statusLabel, statusColor, totalInvoices, totalPayments, netBalance };
        });

        totals.opening = summaryRows.reduce((s, r) => s + r.openingBalance, 0);
        totals.debit = summaryRows.reduce((s, r) => s + r.totalInvoices, 0);
        totals.credit = summaryRows.reduce((s, r) => s + r.totalPayments, 0);
        totals.balance = summaryRows.reduce((s, r) => s + r.netBalance, 0);
      } else if (type === "supplier") {
        const suppliersWithData = await prisma.supplier.findMany({
          orderBy: { name: "asc" },
          include: {
            addMaterials: { select: { totalCost: true } },
            expenses: { select: { amount: true } }
          }
        });

        summaryRows = suppliersWithData.map((s) => {
          const totalPurchases = s.addMaterials.reduce((sum, m) => sum + m.totalCost, 0);
          const totalPayments = s.expenses.reduce((sum, e) => sum + e.amount, 0);
          const netBalance = s.openingBalance + totalPurchases - totalPayments;

          let statusLabel = "خالص";
          let statusColor = "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300";
          if (netBalance > 0) { statusLabel = "له مستحقات"; statusColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"; } 
          else if (netBalance < 0) { statusLabel = "عليه ديون"; statusColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"; }

          return { id: s.id, name: s.name, createdAt: s.createdAt as any, openingBalance: s.openingBalance, statusLabel, statusColor, totalInvoices: totalPurchases, totalPayments, netBalance };
        });

        totals.opening = summaryRows.reduce((s, r) => s + r.openingBalance, 0);
        totals.debit = summaryRows.reduce((s, r) => s + r.totalPayments, 0);
        totals.credit = summaryRows.reduce((s, r) => s + r.totalInvoices, 0);
        totals.balance = summaryRows.reduce((s, r) => s + r.netBalance, 0);
      } else if (type === "factory") {
        const factoriesWithData = await prisma.factory.findMany({
          orderBy: { name: "asc" },
          include: {
            productionOrders: { select: { totalOperatingCost: true } },
            expenses: { where: { category: "FACTORY" }, select: { amount: true } }
          }
        });

        summaryRows = factoriesWithData.map((f) => {
          const totalOperating = f.productionOrders.reduce((sum, p) => sum + p.totalOperatingCost, 0);
          const totalPayments = f.expenses.reduce((sum, e) => sum + e.amount, 0);
          const netBalance = f.openingBalance + totalOperating - totalPayments;

          let statusLabel = "خالص";
          let statusColor = "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300";
          if (netBalance > 0) { statusLabel = "له مستحقات"; statusColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"; } 
          else if (netBalance < 0) { statusLabel = "عليه ديون"; statusColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"; }

          return { id: f.id, name: f.name, createdAt: f.createdAt as any, openingBalance: f.openingBalance, statusLabel, statusColor, totalInvoices: totalOperating, totalPayments, netBalance };
        });

        totals.opening = summaryRows.reduce((s, r) => s + r.openingBalance, 0);
        totals.debit = summaryRows.reduce((s, r) => s + r.totalInvoices, 0);
        totals.credit = summaryRows.reduce((s, r) => s + r.totalPayments, 0);
        totals.balance = summaryRows.reduce((s, r) => s + r.netBalance, 0);
      }
    } else {
      if (type === "client") {
        const [invoices, payments] = await Promise.all([
          prisma.salesInvoice.findMany({ where: { clientId: selectedEntity.id }, orderBy: { date: "asc" } }),
          prisma.payment.findMany({ where: { clientId: selectedEntity.id }, orderBy: { date: "asc" } }),
        ]);

        const invMoves = invoices.filter((i) => i.status !== "CANCELLED").map((i) => ({ date: i.date, type: "فاتورة مبيعات", description: `طلب رقم #${i.orderNumber}`, debit: i.netTotal, credit: 0 }));
        const payMoves = payments.map((p) => ({ date: p.date, type: "دفعة نقدية", description: p.notes || "سداد حساب", debit: 0, credit: p.amount }));
        movements = [...invMoves, ...payMoves];
      } else if (type === "supplier") {
        const [addMaterials, expenses] = await Promise.all([
          prisma.addMaterial.findMany({ where: { supplierId: selectedEntity.id }, include: { material: true }, orderBy: { date: "asc" } }),
          prisma.expense.findMany({ where: { supplierId: selectedEntity.id }, orderBy: { date: "asc" } }),
        ]);

        const matMoves = addMaterials.map((m) => ({ date: m.date, type: "توريد خامات", description: `${m.quantityKg} كجم - ${m.material.name}`, debit: 0, credit: m.totalCost }));
        const expMoves = expenses.map((e) => ({ date: e.date, type: "دفعة مسددة", description: e.item || "دفعة نقدية", debit: e.amount, credit: 0 }));
        movements = [...matMoves, ...expMoves];
      }

      movements.sort((a, b) => a.date.getTime() - b.date.getTime());
      const debit = movements.reduce((s, m) => s + m.debit, 0);
      const credit = movements.reduce((s, m) => s + m.credit, 0);
      totals.balance = type === "client" ? totals.opening + debit - credit : totals.opening + credit - debit;
      totals.debit = debit;
      totals.credit = credit;
    }
  }

  const getTypeLabel = () => {
    if (type === "supplier") return "المورد";
    if (type === "factory") return "المصنع";
    return "العميل";
  };

  const currentDateFormatted = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });

  // Serialised data for the hidden print template (no Date objects → strings)
  const printData = selectedEntity && !(type === "factory" && selectedId && selectedId !== "all") ? {
    entityName: selectedEntity.name,
    typeLabel: getTypeLabel(),
    isAll,
    dateStr: currentDateFormatted,
    totals,
    movements: movements.map((m) => ({
      date: m.date instanceof Date ? m.date.toISOString() : String(m.date),
      type: m.type,
      description: m.description,
      debit: m.debit,
      credit: m.credit,
    })),
    summaryRows: summaryRows.map((r) => ({
      id: r.id,
      name: r.name,
      statusLabel: r.statusLabel,
      netBalance: r.netBalance,
      totalInvoices: r.totalInvoices,
      totalPayments: r.totalPayments,
    })),
  } : null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between no-print flex-wrap gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-sky-400/40 shadow-xs">
            <img src="/rtx-logo.png" alt="RTX Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {isAll ? "كشف حساب مجمع شامل" : "كشف حساب تفصيلي"}
            </h1>
            <p className="text-xs text-[#0ea5e9] dark:text-[#38bdf8] font-bold">نظام كشوف الحسابات - RTX</p>
          </div>
        </div>
        {selectedEntity && (
          <PrintButton targetId="printable-client-statement" fileName={`كشف_حساب_${getTypeLabel()}_${selectedEntity.name}`} />
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-px no-print bg-white dark:bg-zinc-900 px-3 pt-3 rounded-t-xl">
        <Link href="?type=client&id=all" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "client" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <Users className="w-3.5 h-3.5" /> كشوف العملاء
        </Link>
        <Link href="?type=supplier&id=all" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "supplier" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <Truck className="w-3.5 h-3.5" /> كشوف الموردين
        </Link>
        <Link href="?type=factory&id=all" className={`pb-2.5 px-4 font-bold text-xs transition-all border-b-2 ${type === "factory" ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"} flex items-center gap-1.5 rounded-t-lg`}>
          <FactoryIcon className="w-3.5 h-3.5" /> كشوف المصانع
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 p-3 no-print">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">اختر {getTypeLabel()}:</label>
        <div className="flex flex-wrap gap-1.5">
          <Link href={`/statement?type=${type}&id=all`} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedId === "all" ? "bg-[#0ea5e9] text-white shadow-xs" : "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100"}`}>كشف مجمع (الكل)</Link>
          {activeList.map((c) => (
            <Link key={c.id} href={`/statement?type=${type}&id=${c.id}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedId === c.id ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 dark:bg-zinc-800 text-slate-700"}`}>{c.name}</Link>
          ))}
        </div>
      </div>

      {!selectedEntity ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">اختر حساباً</h3>
        </div>
      ) : (
        <>
          {type === "factory" && selectedId && selectedId !== "all" ? (
            <FactoryStatement factoryId={selectedId} />
          ) : (
            <div className="printable-statement-content w-full">
              {printData && <StatementPrintTemplate data={printData} />}
            </div>
          )}
        </>
      )}
    </div>

  );
}
