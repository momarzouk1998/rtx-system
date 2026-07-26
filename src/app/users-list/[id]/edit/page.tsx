import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateUserAdmin } from "../../../actions/users";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  async function onSubmit(formData: FormData) {
    'use server';
    const result = await updateUserAdmin(id, formData);
    if (result.success) {
      redirect(`/users-list`);
    }
  }

  return (
    <div className="space-y-4">
      <Link href={`/users-list`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة المستخدمين
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل بيانات المستخدم</h1>
        
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الاسم *
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={user.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم الهاتف *
              </label>
              <input 
                type="tel" 
                name="phone" 
                required 
                defaultValue={user.phone}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الصلاحية
            </label>
            <select 
              name="role" 
              defaultValue={user.role}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-[#12829b] focus:border-transparent outline-none transition-all dark:text-white"
            >
              <option value="USER">مستخدم (إضافة وتعديل)</option>
              <option value="MANAGER">مدير (صلاحيات كاملة)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href={`/users-list`}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="bg-[#12829b] hover:bg-[#0e687c] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
