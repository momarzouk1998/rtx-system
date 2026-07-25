'use client';

import { useState } from "react";
import { updateInvoiceStatus } from "../actions/sales";
import toast from "react-hot-toast";

type Status = "PROCESSING" | "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const statusOptions: { value: Status; label: string }[] = [
  { value: "PROCESSING", label: "قيد التشغيل" },
  { value: "ORDERED", label: "تم الطلب" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "إلغاء الطلب" },
];

const statusColors: Record<Status, string> = {
  PROCESSING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  ORDERED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  SHIPPED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  DELIVERED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export function StatusUpdater({ invoiceId, current }: { invoiceId: string; current: Status }) {
  const [status, setStatus] = useState<Status>(current);
  const [isPending, setIsPending] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status;
    setIsPending(true);
    const result = await updateInvoiceStatus(invoiceId, newStatus);
    setIsPending(false);

    if (result.success) {
      setStatus(newStatus);
      toast.success("تم تحديث الحالة");
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={onChange}
        disabled={isPending}
        className={`appearance-none cursor-pointer text-xs font-medium px-2.5 py-1.5 pr-7 rounded-full border-0 outline-none disabled:opacity-60 ${statusColors[status]}`}
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px]">▼</span>
    </div>
  );
}
