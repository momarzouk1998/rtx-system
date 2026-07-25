'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, Activity, ArrowUpRight, ArrowDownRight, Wallet, Factory, Package, DollarSign } from 'lucide-react';

const stats = [
  { icon: '🛒', label: 'مبيعات اليوم', value: '124,500 ج.م', subValue: '12 فاتورة', color: 'green' },
  { icon: '📅', label: 'مبيعات الشهر', value: '342,000 ج.م', subValue: '45 فاتورة', color: 'blue' },
  { icon: '💰', label: 'صافي ربح الشهر', value: '45,200 ج.م', subValue: 'بعد التكلفة', color: 'orange' },
  { icon: '📂', label: 'فواتير مفتوحة', value: '4', subValue: 'قيد التنفيذ', color: 'purple' },
];

const moneyStats = [
  { icon: '💳', label: 'ديون العملاء', value: '45,200 ج.م', subValue: 'ليستحقة لك', color: 'red' },
  { icon: '🏦', label: 'ديون الموردين', value: '12,500 ج.م', subValue: 'عليك لموردين', color: 'yellow' },
  { icon: '🧾', label: 'شيكات معلقة', value: '3', subValue: 'تحت التحصيل', color: 'purple' },
  { icon: '📦', label: 'قيمة المخزون', value: '89,000 ج.م', subValue: 'بآخر سعر شراء', color: 'green' },
];

const systemStats = [
  { icon: '⏳', label: 'فواتير لم تُحصّل', value: '23,000 ج.م', subValue: 'مكتملة ورصيد متبقي', color: 'red' },
  { icon: '📋', label: 'مشتريات لم تُسدّد', value: '8,500 ج.م', subValue: 'مكتملة ورصيد متبقي', color: 'yellow' },
  { icon: '📊', label: 'إجمالي المنتجات', value: '156', subValue: 'في 3 مخازن', color: 'blue' },
  { icon: '👥', label: 'إجمالي العملاء', value: '42', subValue: '+ 8 مورد', color: 'green' },
];

const smallStats = [
  { icon: '🏷️', label: 'المنتجات', value: '156' },
  { icon: '👥', label: 'العملاء', value: '42' },
  { icon: '🏭', label: 'الموردين', value: '8' },
  { icon: '🏢', label: 'المخازن', value: '3' },
  { icon: '⚠️', label: 'تحت الحد الأدنى', value: '5', highlight: true },
];

function KpiCard({ icon, label, value, subValue, color }: { icon: string; label: string; value: string; subValue: string; color: string }) {
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
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-extrabold text-gray-800">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{subValue}</div>
    </div>
  );
}

function SmallStat({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card text-center ${highlight ? 'ring-2 ring-red-300 bg-red-50' : ''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">📊 الرئيسية</h1>
          <p className="text-sm text-gray-500 mt-1">أهلاً بك — {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* KPIs — sales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <KpiCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* KPIs — money & debt */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moneyStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <KpiCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* KPIs — المعلقات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            <KpiCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {smallStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            <SmallStat {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Alert for low stock */}
      {smallStats[4].highlight && (
        <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-2">⚠️ تنبيه: 5 أصناف تحت الحد الأدنى</h3>
          <a href="/inventory" className="text-sm text-red-700 underline">عرض المخزون ←</a>
        </div>
      )}
    </div>
  );
}
