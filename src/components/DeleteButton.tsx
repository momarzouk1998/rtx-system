'use client';

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./Modal";

interface DeleteButtonProps {
  /** دالة الحذف (server action) — بتستدعى بعد التأكيد */
  onDelete?: () => Promise<void>;
  /** Server action للحذف — بتاخد id كـ أول parameter (بديل عن onDelete) */
  deleteAction?: (id: string) => Promise<any>;
  /** معرّف العنصر اللي هيتحذف — مطلوب مع deleteAction */
  id?: string;
  /** اسم العنصر اللي بيتحذف (بيظهر في رسالة التأكيد) — اختياري */
  itemName?: string;
  /** صيغة زر الحذف: أيقونة بس (في الجدول) أو زر كامل (في صفحة التفاصيل) */
  variant?: "icon" | "labeled";
  /** محتوى الرسالة التعريفية اللي فوق السؤال — اختياري */
  warning?: string;
}

export function DeleteButton({ onDelete, deleteAction, id, itemName, variant = "icon", warning }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    try {
      if (deleteAction && id) {
        await deleteAction(id);
      } else if (onDelete) {
        await onDelete();
      }
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      {variant === "labeled" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          حذف
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="تأكيد الحذف" maxWidth="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                هل أنت متأكد من الحذف؟
              </p>
              {itemName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  سيتم حذف: <span className="font-medium">{itemName}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                لا يمكن التراجع عن هذه العملية.
              </p>
              {warning && (
                <p className="text-xs text-red-600 dark:text-red-400 pt-1">{warning}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              نعم، احذف
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
