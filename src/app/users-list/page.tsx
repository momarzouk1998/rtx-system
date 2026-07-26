import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { UsersRound, Phone, MessageCircle, Mail, Edit } from "lucide-react";
import Link from "next/link";
import { AddUserButton } from "./AddUserButton";

export default async function UsersListPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <UsersRound className="w-8 h-8 text-[#12829b]" />
          قائمة المستخدمين
        </h1>
        <AddUserButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الاسم</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الوظيفة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التواصل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الصلاحية</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">تاريخ الإضافة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا يوجد مستخدمين مسجلين. اضغط على &quot;إضافة مستخدم&quot; لإضافة مستخدمين جدد.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {user.job || "—"}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300" dir="ltr">
                        <Phone className="w-4 h-4 text-[#12829b]" />
                        {user.phone || "—"}
                      </div>
                      {user.whatsapp && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400" dir="ltr">
                          <MessageCircle className="w-4 h-4" />
                          {user.whatsapp}
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2 text-gray-500" dir="ltr">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "MANAGER" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#12829b]/10 text-[#12829b]">
                          مدير
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                          مستخدم
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/users-list/${user.id}/edit`} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
