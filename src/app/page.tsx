'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, Activity, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

const stats = [
  { name: 'السيولة المتاحة (الخزينة)', value: '342,000 EGP', icon: Wallet, change: '+4.75%', changeType: 'positive' },
  { name: 'إجمالي المبيعات (هذا الشهر)', value: '124,500 EGP', icon: TrendingUp, change: '+54.02%', changeType: 'positive' },
  { name: 'مستحقات خارجية (ديون)', value: '45,200 EGP', icon: Users, change: '-1.39%', changeType: 'negative' },
  { name: 'أوامر التشغيل المفتوحة', value: '4', icon: Activity, change: '+1', changeType: 'positive' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#38bdf8]">قائمة المركز المالي</h2>
          <p className="mt-2 text-gray-400">ملخص الأداء المالي والتشغيلي لنظام RTX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark p-6 rounded-2xl hover-lift relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-24 h-24 text-[#38bdf8]" />
            </div>
            <div className="relative z-10 flex items-center">
              <div className="p-3 bg-[#12829b]/20 rounded-xl">
                <stat.icon className="h-6 w-6 text-[#38bdf8]" aria-hidden="true" />
              </div>
              <p className="mr-4 text-sm font-medium text-gray-400 truncate">{stat.name}</p>
            </div>
            <div className="relative z-10 mt-4 flex items-baseline pb-6">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p
                className={`mr-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-400" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4 text-red-400" aria-hidden="true" />
                )}
                <span className="mr-1">{stat.change}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
