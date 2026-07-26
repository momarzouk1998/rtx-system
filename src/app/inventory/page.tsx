'use client';

import { motion } from 'framer-motion';
import { Package, Box, RefreshCw, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const inventoryStats = [
  { name: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ø®Ø§Ù…', value: '1,450 Kg', icon: Box, change: '+50 Kg' },
  { name: 'Ø§Ù„Ù…Ù†ØªØ¬ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ (Ø£ÙƒÙŠØ§Ø³)', value: '12,000 ÙƒÙŠØ³', icon: Package, change: '-200 ÙƒÙŠØ³' },
  { name: 'ØªØ­Øª Ø§Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠ', value: '400 Kg', icon: RefreshCw, change: 'Ù†Ø´Ø·' },
];

export default function InventoryDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#38bdf8]">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø®Ø§Ø²Ù†</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Ø­Ø±ÙƒØ© Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ø®Ø§Ù… ÙˆØ§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
          <PlusCircle className="w-5 h-5" />
          <span>Ø¥Ø¶Ø§ÙØ© Ø­Ø±ÙƒØ© Ù…Ø®Ø²Ù†ÙŠØ©</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {inventoryStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark p-6 rounded-2xl hover-lift relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10 flex items-center">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <stat.icon className="h-6 w-6 text-amber-400" aria-hidden="true" />
              </div>
              <p className="mr-4 text-sm font-medium text-gray-400 truncate">{stat.name}</p>
            </div>
            <div className="relative z-10 mt-4 flex items-baseline pb-6">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mr-2 text-sm text-gray-400">{stat.change}</p>
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
            <h3 className="text-xl font-semibold text-[#38bdf8]">Ø­Ø±ÙƒØ© Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ø®Ø§Ù… (ÙˆØ§Ø±Ø¯/Ù…Ù†ØµØ±Ù)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
                  <th className="px-4 py-3">Ø§Ù„Ø®Ø§Ù…Ø©</th>
                  <th className="px-4 py-3">Ø§Ù„Ù†ÙˆØ¹</th>
                  <th className="px-4 py-3 rounded-tl-lg">Ø§Ù„ÙƒÙ…ÙŠØ©</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">2026-07-08</td>
                  <td className="px-4 py-3 text-white font-medium">Ø¨ÙˆÙ„ÙŠ Ø¥ÙŠØ«ÙŠÙ„ÙŠÙ†</td>
                  <td className="px-4 py-3 text-green-400 flex items-center gap-1"><ArrowDownRight className="w-4 h-4"/> ÙˆØ§Ø±Ø¯ (Ù…ÙˆØ±Ø¯)</td>
                  <td className="px-4 py-3 text-white font-medium">500 Kg</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">2026-07-07</td>
                  <td className="px-4 py-3 text-white font-medium">Ø®Ø§Ù…Ø© Ø¨Ù„Ø§Ø³ØªÙŠÙƒ Ø£</td>
                  <td className="px-4 py-3 text-amber-400 flex items-center gap-1"><ArrowUpRight className="w-4 h-4"/> Ù…Ù†ØµØ±Ù (Ù…ØµÙ†Ø¹)</td>
                  <td className="px-4 py-3 text-white font-medium">100 Kg</td>
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
            <h3 className="text-xl font-semibold text-[#38bdf8]">Ø§Ù„Ù…Ù†ØªØ¬ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-white/5 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">Ø§Ù„Ù…Ù†ØªØ¬</th>
                  <th className="px-4 py-3">Ø±ØµÙŠØ¯ Ø§Ù„Ø£ÙƒÙŠØ§Ø³</th>
                  <th className="px-4 py-3">Ø§Ù„Ø£Ø±Ø¨Ø§Ø­ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">Ø£ÙƒÙŠØ§Ø³ Ù…Ù‚Ø§Ø³ 20x30</td>
                  <td className="px-4 py-3 text-green-400 font-bold">5,400</td>
                  <td className="px-4 py-3 text-white">10,800</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">Ø£ÙƒÙŠØ§Ø³ Ù…Ø·Ø¨ÙˆØ¹Ø© RTX</td>
                  <td className="px-4 py-3 text-green-400 font-bold">2,100</td>
                  <td className="px-4 py-3 text-white">6,300</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

