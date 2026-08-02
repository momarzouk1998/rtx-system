'use client';

import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createProductionOrder } from "../actions/production";
import { todayDateInputValue } from "@/lib/utils";
import toast from "react-hot-toast";

type Factory = { id: string; name: string };
type Product = { id: string; name: string; bagsPerKg: number; operatingCost: number; material: { name: string } };

export function AddProductionButton({ factories, products }: { factories: Factory[], products: Product[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [category, setCategory] = useState<"INTERNAL" | "EXTERNAL">("EXTERNAL");
  const [scenario, setScenario] = useState<"DELIVER" | "RECEIVE" | "BOTH">("BOTH");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [receivedQuantity, setReceivedQuantity] = useState<number | "">("");
  const [operatingCost, setOperatingCost] = useState<number | "">("");

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
  [selectedProductId, products]);

  // When product changes, update operatingCost default
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) setOperatingCost(prod.operatingCost);
  };

  // Live calculations — use custom operatingCost if set
  const expectedBags = selectedProduct && receivedQuantity ? Math.round(Number(receivedQuantity) * selectedProduct.bagsPerKg) : 0;
  const effectiveCost = operatingCost !== "" ? Number(operatingCost) : (selectedProduct?.operatingCost || 0);
  const expectedCost = selectedProduct && receivedQuantity && category === "EXTERNAL" 
    ? Number(receivedQuantity) * effectiveCost : 0;

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createProductionOrder(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم إضافة أمر التصنيع بنجاح");
      setIsOpen(false);
      // Reset form
      setCategory("EXTERNAL");
      setScenario("BOTH");
      setSelectedProductId("");
      setQuantity("");
      setReceivedQuantity("");
      setOperatingCost("");
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#12829b] hover:bg-[#0e687c] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        إضافة أمر تصنيع
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="إضافة أمر تصنيع جديد" maxWidth="lg">
        <form action={onSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              التاريخ
            </label>
            <input
              type="date"
              name="date"
              defaultValue={todayDateInputValue()}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex gap-4 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <label className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-colors ${category === 'EXTERNAL' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold text-[#12829b]' : 'text-gray-500 hover:text-gray-700'}`}>
              <input type="radio" name="category" value="EXTERNAL" className="hidden" checked={category === 'EXTERNAL'} onChange={() => setCategory('EXTERNAL')} />
              مصنع آخر (تشغيل خارجي)
            </label>
            <label className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-colors ${category === 'INTERNAL' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <input type="radio" name="category" value="INTERNAL" className="hidden" checked={category === 'INTERNAL'} onChange={() => setCategory('INTERNAL')} />
              تصنيع داخلي
            </label>
          </div>

          {category === 'EXTERNAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المصنع (المُشغّل) *
              </label>
              <select 
                name="factoryId" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">اختر المصنع...</option>
                {factories.map((factory) => (
                  <option key={factory.id} value={factory.id}>{factory.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المنتج المراد تصنيعه *
            </label>
            <select 
              name="productId" 
              required
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="">اختر المنتج...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (خامة: {product.material.name})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario selector - للتصنيع الخارجي فقط */}
          {category === 'EXTERNAL' && (
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-emerald-950/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-sm">
              <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm flex items-center gap-2">
                🎯 نوع العملية
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <label className={`text-center py-3 px-2 rounded-lg cursor-pointer transition-all border-2 ${
                  scenario === 'DELIVER' 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md scale-105 font-bold' 
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                }`}>
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="DELIVER" 
                    className="hidden" 
                    checked={scenario === 'DELIVER'} 
                    onChange={() => {
                      setScenario('DELIVER');
                      setReceivedQuantity(0);
                    }} 
                  />
                  <div className="text-2xl mb-1">📤</div>
                  <div className="text-xs font-semibold">تسليم خامات فقط</div>
                </label>
                
                <label className={`text-center py-3 px-2 rounded-lg cursor-pointer transition-all border-2 ${
                  scenario === 'RECEIVE' 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105 font-bold' 
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}>
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="RECEIVE" 
                    className="hidden" 
                    checked={scenario === 'RECEIVE'} 
                    onChange={() => {
                      setScenario('RECEIVE');
                      setQuantity(0);
                    }} 
                  />
                  <div className="text-2xl mb-1">📥</div>
                  <div className="text-xs font-semibold">استلام منتج فقط</div>
                </label>
                
                <label className={`text-center py-3 px-2 rounded-lg cursor-pointer transition-all border-2 ${
                  scenario === 'BOTH' 
                    ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white border-purple-600 shadow-md scale-105 font-bold' 
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}>
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="BOTH" 
                    className="hidden" 
                    checked={scenario === 'BOTH'} 
                    onChange={() => setScenario('BOTH')} 
                  />
                  <div className="text-2xl mb-1">📤📥</div>
                  <div className="text-xs font-semibold">أمر تصنيع كامل</div>
                </label>
              </div>
            </div>
          )}

          {/* تسليم خامات - يظهر في DELIVER و BOTH فقط (للتصنيع الخارجي) أو دايمًا للداخلي */}
          {(category === 'INTERNAL' || scenario === 'DELIVER' || scenario === 'BOTH') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📤 تسليم خامات (كجم منصرف) *
              </label>
              <input 
                type="number" 
                name="quantityKg" 
                min="0"
                step="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="مثال: 500"
                className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-all dark:text-white text-lg font-bold text-blue-700 dark:text-blue-300 placeholder:text-blue-300 dark:placeholder:text-blue-700"
              />
            </div>
          )}
          {/* Hidden input for RECEIVE scenario (EXTERNAL only) */}
          {category === 'EXTERNAL' && scenario === 'RECEIVE' && <input type="hidden" name="quantityKg" value="0" />}

          {/* استلام منتج - يظهر في RECEIVE و BOTH فقط (للتصنيع الخارجي) أو دايمًا للداخلي */}
          {(category === 'INTERNAL' || scenario === 'RECEIVE' || scenario === 'BOTH') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📥 استلام منتج (كجم مستلم) *
              </label>
              <input 
                type="number" 
                name="receivedQuantityKg" 
                min="0"
                step="0.01"
                required
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(Number(e.target.value))}
                placeholder="مثال: 450"
                className="w-full px-4 py-2 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition-all dark:text-white text-lg font-bold text-emerald-700 dark:text-emerald-300 placeholder:text-emerald-300 dark:placeholder:text-emerald-700"
              />
            </div>
          )}
          {/* Hidden input for DELIVER scenario (EXTERNAL only) */}
          {category === 'EXTERNAL' && scenario === 'DELIVER' && <input type="hidden" name="receivedQuantityKg" value="0" />}

          {/* Editable operating cost for EXTERNAL */}
          {category === 'EXTERNAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                💰 سعر التصنيع (لكل كجم) *
                {selectedProduct && <span className="text-xs text-orange-500 dark:text-orange-400 mr-2 font-semibold">الافتراضي: {selectedProduct.operatingCost} ج</span>}
              </label>
              <input 
                type="number" 
                name="operatingCost" 
                required
                min="0"
                step="0.01"
                value={operatingCost}
                onChange={(e) => setOperatingCost(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={selectedProduct ? `${selectedProduct.operatingCost}` : "0"}
                className="w-full px-4 py-2 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 outline-none transition-all dark:text-white text-lg font-bold text-orange-700 dark:text-orange-300 placeholder:text-orange-300 dark:placeholder:text-orange-700"
              />
            </div>
          )}
          <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-[#12829b]/10 dark:via-zinc-800 dark:to-emerald-900/10 p-4 rounded-lg space-y-2 border-2 border-blue-200 dark:border-[#12829b]/30 shadow-sm">
            <h4 className="font-bold text-[#12829b] mb-3 flex items-center gap-2">
              <span className="text-lg">🔢</span>
              حسابات متوقعة (تلقائية)
            </h4>
            <div className="flex justify-between items-center text-sm bg-white dark:bg-zinc-900/50 px-3 py-2 rounded-md">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <span>📦</span> عدد الأكياس المنتجة:
              </span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{expectedBags.toLocaleString()} كيس</span>
            </div>
            {category === 'EXTERNAL' && (
              <div className="flex justify-between items-center text-sm bg-white dark:bg-zinc-900/50 px-3 py-2 rounded-md">
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span>💰</span> إجمالي تكلفة التشغيل:
                </span>
                <span className="font-bold text-lg text-orange-600 dark:text-orange-400">{expectedCost.toLocaleString()} ج</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ملاحظات
            </label>
            <textarea 
              name="notes" 
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedProductId || 
                (category === 'EXTERNAL' && scenario === 'DELIVER' && !quantity) || 
                (category === 'EXTERNAL' && scenario === 'RECEIVE' && !receivedQuantity) ||
                (category === 'EXTERNAL' && scenario === 'BOTH' && (!quantity || !receivedQuantity)) ||
                (category === 'INTERNAL' && (!quantity || !receivedQuantity))
              }
              className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : 'تنفيذ الأمر'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
