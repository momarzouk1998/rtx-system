'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Users, Receipt, PlusCircle, CheckCircle, Clock } from 'lucide-react';

const salesStats = [
  { name: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª (Ø§Ù„Ø´Ù‡Ø±)', value: 'EGP 124,500', icon: ShoppingCart, change: '+15%' },
  { name: 'Ù…Ø³ØªØ­Ù‚Ø§Øª Ø®Ø§Ø±Ø¬ÙŠØ© (Ø¯ÙŠÙˆÙ†)', value: 'EGP 15,400', icon: Clock, change: '-5%' },
  { name: 'Ø¹Ø¯Ø¯ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø§Ù„Ù†Ø´Ø·ÙŠÙ†', value: '34', icon: Users, change: '+2' },
];

export default function SalesDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#38bdf8]">Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Ø¥Ø¯Ø§Ø±Ø© ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª ÙˆØ­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-colors font-medium">
            <Users className="w-5 h-5" />
            <span>Ø¥Ø¶Ø§ÙØ© Ø¹Ù…ÙŠÙ„</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
            <PlusCircle className="w-5 h-5" />
            <span>Ø¥ØµØ¯Ø§Ø± ÙØ§ØªÙˆØ±Ø© Ù…Ø¨ÙŠØ¹Ø§Øª</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {salesStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark p-6 rounded-2xl hover-lift relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10 flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <stat.icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <p className="mr-4 text-sm font-medium text-gray-400 truncate">{stat.name}</p>
            </div>
            <div className="relative z-10 mt-4 flex items-baseline pb-6">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mr-2 text-sm text-green-400">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark p-6 rounded-2xl flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#38bdf8]">Ø¢Ø®Ø± Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„ØµØ§Ø¯Ø±Ø©</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©</th>
                  <th className="px-4 py-3">Ø§Ù„Ø¹Ù…ÙŠÙ„</th>
                  <th className="px-4 py-3">Ø§Ù„Ù‚ÙŠÙ…Ø©</th>
                  <th className="px-4 py-3 rounded-tl-lg">Ø§Ù„Ø­Ø§Ù„Ø©</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">INV-1023</td>
                  <td className="px-4 py-3 text-white font-medium">Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù…Ù„</td>
                  <td className="px-4 py-3">12,500 EGP</td>
                  <td className="px-4 py-3 text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Ù…Ø³Ø¯Ø¯Ø©</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">INV-1024</td>
                  <td className="px-4 py-3 text-white font-medium">Ù…Ø­Ù„Ø§Øª Ø§Ù„Ù†ÙˆØ±</td>
                  <td className="px-4 py-3">8,200 EGP</td>
                  <td className="px-4 py-3 text-amber-400 flex items-center gap-1"><Clock className="w-4 h-4"/> Ø¢Ø¬Ù„</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark p-6 rounded-2xl flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#38bdf8]">Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ (ÙƒØ´Ù Ø­Ø³Ø§Ø¨ Ø³Ø±ÙŠØ¹)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">Ø§Ù„Ø¹Ù…ÙŠÙ„</th>
                  <th className="px-4 py-3">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙÙˆØ§ØªÙŠØ±</th>
                  <th className="px-4 py-3">Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª</th>
                  <th className="px-4 py-3 rounded-tl-lg">Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">Ù…Ø­Ù„Ø§Øª Ø§Ù„Ù†ÙˆØ±</td>
                  <td className="px-4 py-3">25,000</td>
                  <td className="px-4 py-3 text-green-400">16,800</td>
                  <td className="px-4 py-3 text-red-400 font-bold">-8,200</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù…Ù„</td>
                  <td className="px-4 py-3">12,500</td>
                  <td className="px-4 py-3 text-green-400">12,500</td>
                  <td className="px-4 py-3 text-gray-400">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

