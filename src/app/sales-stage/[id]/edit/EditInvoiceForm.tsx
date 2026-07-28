'use client';

import { useState, useMemo } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { updateSalesInvoice } from "../../../actions/sales";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Client = { id: string; name: string };
type Product = { id: string; name: string; bagPrice: number };
type InvoiceItem = {
  productId: string;
  quantity: number;
  bagPrice: number;
};

type Invoice = {
  id: string;
  orderNumber: number;
  clientId: string;
  discountValue: number;
  paymentMethod: string | null;
  notes: string | null;
  date: string; // YYYY-MM-DD
};

export function EditInvoiceForm({ 
  invoice, 
  clients, 
  products, 
  initialItems 
}: { 
  invoice: Invoice;
  clients: Client[]; 
  products: Product[]; 
  initialItems: InvoiceItem[];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  const [clientId, setClientId] = useState(invoice.clientId);
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [discountValue, setDiscountValue] = useState<number>(invoice.discountValue);
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod || "CASH");
  const [notes, setNotes] = useState(invoice.notes || "");
  const [date, setDate] = useState(invoice.date);

  // For adding a new item row
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [itemPrice, setItemPrice] = useState<number | "">("");

  const handleAddItem = () => {
    if (!selectedProductId || !quantity || !itemPrice) return;
    
    const existingItemIndex = items.findIndex(i => i.productId === selectedProductId && i.bagPrice === Number(itemPrice));
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += Number(quantity);
      setItems(newItems);
    } else {
      setItems([...items, { productId: selectedProductId, quantity: Number(quantity), bagPrice: Number(itemPrice) }]);
    }
    
    setSelectedProductId("");
    setQuantity("");
    setItemPrice("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.bagPrice * item.quantity), 0);
  }, [items]);

  const netTotal = subTotal - discountValue;

  async function onSubmit(formData: FormData) {
    if (items.length === 0) {
      toast.error("يجب إضافة صنف واحد على الأقل");
      return;
    }

    formData.append("clientId", clientId);
    formData.append("items", JSON.stringify(items));
    formData.append("discountValue", discountValue.toString());
    formData.append("paymentMethod", paymentMethod || "CASH");
    formData.append("notes", notes);
    formData.append("date", date);
    
    setIsPending(true);
    const result = await updateSalesInvoice(invoice.id, formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم تعديل الفاتورة بنجاح");
      router.push("/sales-stage");
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          تاريخ الفاتورة
        </label>
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
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
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find(prod => prod.id === e.target.value);
              if (p) setItemPrice(p.bagPrice);
              else setItemPrice("");
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-sm"
          >
            <option value="">اختر المنتج...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (أساسي: {product.bagPrice})
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
          <input 
            type="number" 
            placeholder="السعر" 
            min="0"
            step="0.01"
            value={itemPrice}
            onChange={(e) => setItemPrice(Number(e.target.value))}
            className="w-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white text-sm"
          />
          <button 
            type="button"
            onClick={handleAddItem}
            disabled={!selectedProductId || !quantity || itemPrice === ""}
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
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.bagPrice}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.quantity} كيس</td>
                      <td className="px-4 py-2 text-[#12829b] font-medium">{item.bagPrice * item.quantity}</td>
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
            <span className="font-medium text-gray-900 dark:text-gray-100">{subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-t border-[#12829b]/20 pt-2 mt-2">
            <span className="font-bold text-[#12829b]">الصافي المطلوب:</span>
            <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">{netTotal.toLocaleString()}</span>
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
          disabled={isPending || !clientId || items.length === 0}
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
