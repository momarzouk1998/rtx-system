import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, ShoppingCart, Package, DollarSign, Factory, Layers, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Get real data from database
  const [
    todaySales,
    monthSales,
    monthProfit,
    openInvoices,
    clientDebts,
    totalMaterials,
    totalProducts,
    totalClients,
    totalSuppliers,
    totalFactories,
    activeProductionOrders,
    monthExpenses,
  ] = await Promise.all([
    // Today's sales
    prisma.salesInvoice.aggregate({
      where: {
        date: { gte: today },
        status: { not: 'CANCELLED' }
      },
      _sum: { netTotal: true },
      _count: true,
    }),
    
    // Month's sales
    prisma.salesInvoice.aggregate({
      where: {
        date: { gte: monthStart },
        status: { not: 'CANCELLED' }
      },
      _sum: { netTotal: true },
      _count: true,
    }),
    
    // Month's profit
    prisma.salesInvoice.aggregate({
      where: {
        date: { gte: monthStart },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalProfit: true },
    }),
    
    // Open invoices
    prisma.salesInvoice.count({
      where: { status: { in: ['ORDERED', 'PROCESSING'] } },
    }),
    
    // Client debts
    prisma.$queryRaw`
      SELECT COALESCE(SUM(c.openingBalance + COALESCE(inv.total, 0) - COALESCE(pay.total, 0)), 0) as total
      FROM Client c
      LEFT JOIN (
        SELECT clientId, SUM(netTotal) as total
        FROM SalesInvoice
        WHERE status != 'CANCELLED'
        GROUP BY clientId
      ) inv ON c.id = inv.clientId
      LEFT JOIN (
        SELECT clientId, SUM(amount) as total
        FROM Payment
        GROUP BY clientId
      ) pay ON c.id = pay.clientId
      WHERE (c.openingBalance + COALESCE(inv.total, 0) - COALESCE(pay.total, 0)) > 0
    `,
    
    // Total materials
    prisma.material.count(),
    
    // Total products
    prisma.product.count(),
    
    // Total clients
    prisma.client.count(),
    
    // Total suppliers
    prisma.supplier.count(),
    
    // Total factories
    prisma.factory.count(),
    
    // Active production orders
    prisma.productionOrder.count(),
    
    // Month's expenses
    prisma.expense.aggregate({
      where: {
        date: { gte: monthStart }
      },
      _sum: { amount: true },
    }),
  ]);

  const clientDebtsTotal = Number((clientDebts as any)[0]?.total || 0);
  const monthExpensesTotal = monthExpenses._sum.amount || 0;
  const netProfit = (monthProfit._sum.totalProfit || 0) - monthExpensesTotal;

  const stats = [
    { icon: ShoppingCart, label: 'مبيعات اليوم', value: (todaySales._sum.netTotal || 0).toLocaleString('ar-EG'), subValue: `${todaySales._count} فاتورة`, color: 'green' },
    { icon: TrendingUp, label: 'مبيعات الشهر', value: (monthSales._sum.netTotal || 0).toLocaleString('ar-EG'), subValue: `${monthSales._count} فاتورة`, color: 'blue' },
    { icon: DollarSign, label: 'صافي ربح الشهر', value: netProfit.toLocaleString('ar-EG'), subValue: 'بعد المصروفات', color: netProfit >= 0 ? 'green' : 'red' },
    { icon: Package, label: 'فواتير مفتوحة', value: openInvoices.toString(), subValue: 'قيد التنفيذ', color: 'purple' },
  ];

  const moneyStats = [
    { icon: CreditCard, label: 'ديون العملاء', value: clientDebtsTotal.toLocaleString('ar-EG'), subValue: 'مستحقة لك', color: 'red' },
    { icon: Layers, label: 'إجمالي الخامات', value: totalMaterials.toString(), subValue: 'مسجلة في النظام', color: 'blue' },
    { icon: Package, label: 'إجمالي المنتجات', value: totalProducts.toString(), subValue: 'جاهزة للبيع', color: 'green' },
    { icon: DollarSign, label: 'مصروفات الشهر', value: monthExpensesTotal.toLocaleString('ar-EG'), subValue: 'إجمالي المصاريف', color: 'orange' },
  ];

  const systemStats = [
    { icon: Users, label: 'إجمالي العملاء', value: totalClients.toString(), subValue: 'عميل مسجل', color: 'blue' },
    { icon: Factory, label: 'المصانع', value: totalFactories.toString(), subValue: 'للتشغيل الخارجي', color: 'purple' },
    { icon: TrendingUp, label: 'أوامر التصنيع', value: activeProductionOrders.toString(), subValue: 'نشطة حالياً', color: 'orange' },
    { icon: Users, label: 'الموردين', value: totalSuppliers.toString(), subValue: 'مورد مسجل', color: 'green' },
  ];

  const smallStats = [
    { icon: Layers, label: 'الخامات', value: totalMaterials.toString() },
    { icon: Package, label: 'المنتجات', value: totalProducts.toString() },
    { icon: Users, label: 'العملاء', value: totalClients.toString() },
    { icon: Factory, label: 'المصانع', value: totalFactories.toString() },
    { icon: Users, label: 'الموردين', value: totalSuppliers.toString() },
  ];

function KpiCard({ icon: Icon, label, value, subValue, color }: { icon: any; label: string; value: string; subValue: string; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500/10 to-green-500/5 border-green-500/30',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/30',
    orange: 'from-orange-500/15 to-orange-500/5 border-orange-500/40',
    red: 'from-red-500/10 to-red-500/5 border-red-500/30',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/30',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 shadow-card`}>
      <Icon className="w-6 h-6 mb-2 text-gray-600" />
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-extrabold text-gray-800">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{subValue}</div>
    </div>
  );
}

function SmallStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card text-center">
      <Icon className="w-6 h-6 mb-1 mx-auto text-gray-600" />
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">لوحة المتابعة</h1>
          <p className="text-sm text-gray-500 mt-1">أهلاً بك — {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* KPIs — sales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <KpiCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* KPIs — money & inventory */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moneyStats.map((stat) => (
          <KpiCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* KPIs — system */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemStats.map((stat) => (
          <KpiCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {smallStats.map((stat) => (
          <SmallStat key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
