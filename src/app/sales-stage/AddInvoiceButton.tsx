'use client';

import { useState, useMemo } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createSalesInvoice } from "../actions/sales";
import toast from "react-hot-toast";

type Client = { id: string; name: string };
type Product = { id: string; name: string; bagPrice: number };

type InvoiceItem = {
  productId: string;
  quantity: number;
};

export function AddInvoiceButton({ clients, products }: { clients: Client[], products: Product[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // For adding a new item row
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");

  const handleAddItem = () => {
    if (!selectedProductId || !quantity) return;
    
    // Check if product already exists, then update quantity
    const existingItemIndex = items.findIndex(i => i.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += Number(quantity);
      setItems(newItems);
    } else {
      setItems([...items, { productId: selectedProductId, quantity: Number(quantity) }]);
    }
    
    setSelectedProductId("");
    setQuantity("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.bagPrice * item.quantity : 0);
    }, 0);
  }, [items, products]);

  const netTotal = subTotal - discountValue;

  async function onSubmit(formData: FormData) {
    if (items.length === 0) {
      toast.error("يجب إضافة صنف واحد على الأقل");
      return;
    }

    formData.append("items", JSON.stringify(items));
    
    setIsPending(true);
    const result = await createSalesInvoice(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم إصدار الفاتورة بنجاح");
      setIsOpen(false);
      // Reset
      setClientId("");
      setItems([]);
      setDiscountValue(0);
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
        فاتورة جديدة
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="إصدار فاتورة مبيعات" maxWidth="2xl">
        <form action={onSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                العميل *
              </label>
              <select 
                name="clientId" 
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="">اختر العميل...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                طريقة الدفع *
              </label>
              <select 
                name="paymentMethod" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              >
                <option value="CASH">نقدي</option>
                <option value="WALLET">محفظة (فودافون كاش)</option>
                <option value="INSTAPAY">انستاباى</option>
                <option value="BANK_TRANSFER">حساب بنكي</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">أصناف الفاتورة</h4>
            
            <div className="flex gap-2 mb-4">
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-sm"
              >
                <option value="">اختر المنتج...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.bagPrice} ج.م)
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="الكمية (كيس)" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-sm"
              />
              <button 
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || !quantity}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 text-sm"
              >
                إضافة
              </button>
            </div>

            {/* Added Items List */}
            {items.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <table className="w-full text-right text-sm" dir="rtl">
                  <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">المنتج</th>
                      <th className="px-4 py-2 font-medium">السعر</th>
                      <th className="px-4 py-2 font-medium">الكمية</th>
                      <th className="px-4 py-2 font-medium">الإجمالي</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product?.name}</td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{product?.bagPrice} ج.م</td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.quantity} كيس</td>
                          <td className="px-4 py-2 text-[#12829b] font-medium">{(product?.bagPrice || 0) * item.quantity} ج.م</td>
                          <td className="px-4 py-2">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                قيمة الخصم (إن وجد)
              </label>
              <input 
                type="number" 
                name="discountValue" 
                defaultValue="0"
                step="0.01"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
            
            <div className="bg-[#12829b]/10 p-4 rounded-lg border border-[#12829b]/20">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">الإجمالي قبل الخصم:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{subTotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#12829b]/20 pt-2 mt-2">
                <span className="font-bold text-[#12829b]">الصافي المطلوب:</span>
                <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">{netTotal.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ملاحظات الفاتورة
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
              disabled={isPending || !clientId || items.length === 0}
              className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : 'حفظ وإصدار الفاتورة'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
