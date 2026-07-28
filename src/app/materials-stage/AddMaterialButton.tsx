'use client';

import { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { createAddMaterial } from '../actions/materials';

export function AddMaterialButton({ suppliers, materials }: { suppliers: any[], materials: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  
  const total = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createAddMaterial(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setQuantity('');
      setPrice('');
    }
    
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#12829b] hover:bg-[#0e687c] text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        توريد خامات
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">توريد خامات جديدة</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">التاريخ</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">المورد</label>
                  <select
                    name="supplierId"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                  >
                    <option value="">اختر المورد...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الخامة</label>
                <select
                  name="materialId"
                  required
                  onChange={(e) => {
                    const selected = materials.find(m => m.id === e.target.value);
                    if (selected) setPrice(selected.price.toString());
                  }}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                >
                  <option value="">اختر الخامة...</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الكمية (كجم)</label>
                  <input
                    type="number"
                    name="quantityKg"
                    required
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سعر الكيلو</label>
                  <input
                    type="number"
                    name="unitPrice"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl flex justify-between items-center border border-gray-100 dark:border-zinc-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">إجمالي الفاتورة:</span>
                <span className="text-2xl font-bold text-[#12829b]">{total.toLocaleString("ar-EG")}</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#12829b] hover:bg-[#0e687c] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      حفظ العملية
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
