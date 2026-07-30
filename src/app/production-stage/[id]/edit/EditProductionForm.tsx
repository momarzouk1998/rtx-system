'use client';

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { updateProductionOrder } from "../../../actions/production";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Factory = { id: string; name: string };
type Product = { id: string; name: string; bagsPerKg: number; operatingCost: number; material: { name: string } };

type ProductionOrder = {
  id: string;
  category: "INTERNAL" | "EXTERNAL";
  factoryId: string | null;
  productId: string;
  quantityKg: number;
  receivedQuantityKg: number;
  operatingCost: number;
  notes: string | null;
  date: string; // YYYY-MM-DD
};

export function EditProductionForm({ 
  order, 
  factories, 
  products 
}: { 
  order: ProductionOrder;
  factories: Factory[]; 
  products: Product[]; 
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  const [category, setCategory] = useState<"INTERNAL" | "EXTERNAL">(order.category);
  const [selectedProductId, setSelectedProductId] = useState(order.productId);
  const [quantity, setQuantity] = useState<number | "">(order.quantityKg);
  const [receivedQuantity, setReceivedQuantity] = useState<number | "">(order.receivedQuantityKg);
  const [selectedFactoryId, setSelectedFactoryId] = useState(order.factoryId || "");
  const [notes, setNotes] = useState(order.notes || "");
  const [date, setDate] = useState(order.date);
  const [operatingCost, setOperatingCost] = useState<number | "">(order.operatingCost ?? "");

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
  [selectedProductId, products]);

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
    formData.append("category", category);
    formData.append("productId", selectedProductId);
    formData.append("quantityKg", String(quantity));
    formData.append("receivedQuantityKg", String(receivedQuantity));
    formData.append("factoryId", selectedFactoryId);
    formData.append("operatingCost", String(operatingCost !== "" ? operatingCost : (selectedProduct?.operatingCost || 0)));
    formData.append("notes", notes);
    formData.append("date", date);
    
    setIsPending(true);
    const result = await updateProductionOrder(order.id, formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم تعديل أمر التصنيع بنجاح");
      router.push("/production-stage");
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          التاريخ
        </label>
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
            value={selectedFactoryId}
            onChange={(e) => setSelectedFactoryId(e.target.value)}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          تسليم خامات (كجم منصرف) *
        </label>
        <input 
          type="number" 
          name="quantityKg" 
          required
          min="0.1"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-lg font-bold"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          استلام منتج (كجم مستلم) *
        </label>
        <input 
          type="number" 
          name="receivedQuantityKg" 
          required
          min="0"
          step="0.01"
          value={receivedQuantity}
          onChange={(e) => setReceivedQuantity(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-lg font-bold text-emerald-600"
        />
      </div>

      {/* Editable operating cost for EXTERNAL */}
      {category === 'EXTERNAL' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            سعر التصنيع (ج.م / كجم) *
            {selectedProduct && <span className="text-xs text-gray-400 mr-2">الافتراضي: {selectedProduct.operatingCost}</span>}
          </label>
          <input 
            type="number" 
            name="operatingCost" 
            required
            min="0"
            step="0.01"
            value={operatingCost}
            onChange={(e) => setOperatingCost(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all dark:text-white text-lg font-bold text-orange-700 dark:text-orange-300"
          />
        </div>
      )}
      <div className="bg-blue-50 dark:bg-[#12829b]/10 p-4 rounded-lg space-y-2 border border-blue-100 dark:border-[#12829b]/20">
        <h4 className="font-semibold text-[#12829b] mb-3">حسابات متوقعة (تلقائي)</h4>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">عدد الأكياس المنتجة:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{expectedBags} كيس</span>
        </div>
        {category === 'EXTERNAL' && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">إجمالي تكلفة التشغيل:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">{expectedCost.toLocaleString()}</span>
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white resize-none"
        ></textarea>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isPending || !quantity || !selectedProductId}
          className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  );
}
