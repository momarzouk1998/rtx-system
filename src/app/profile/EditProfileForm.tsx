'use client';

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateUser } from "../actions/users";
import toast from "react-hot-toast";

type ProfileData = {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  job?: string | null;
  role: string;
};

export function EditProfileForm({ user }: { user: ProfileData }) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateUser(formData);
    setIsPending(false);

    if (result.success) {
      toast.success("تم تحديث البيانات بنجاح");
    } else {
      toast.error(result.error || "حدث خطأ");
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          الاسم *
        </label>
        <input
          type="text"
          name="name"
          defaultValue={user.name}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            رقم الهاتف *
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={user.phone}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            رقم الواتساب
          </label>
          <input
            type="tel"
            name="whatsapp"
            defaultValue={user.whatsapp || ""}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            defaultValue={user.email || ""}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الوظيفة
          </label>
          <input
            type="text"
            name="job"
            defaultValue={user.job || ""}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  );
}
