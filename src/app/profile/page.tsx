import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { UserCircle, Phone, Mail, Briefcase, ShieldCheck } from "lucide-react";
import { EditProfileForm } from "./EditProfileForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  // بما أنه لا يوجد نظام تسجيل دخول فعلي بعد، نعرض المدير الافتراضي
  // (أو المستخدم المحدد عبر ?id=).
  const user =
    (params.id
      ? await prisma.user.findUnique({ where: { id: params.id } })
      : null) ||
    (await prisma.user.findFirst({
      where: { role: "MANAGER" },
      orderBy: { createdAt: "asc" },
    })) ||
    (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-[#12829b]" />
          الصفحة الشخصية
        </h1>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            لا يوجد مستخدمون مسجلون بعد. أضف مستخدماً من صفحة &quot;قائمة المستخدمين&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
        <UserCircle className="w-8 h-8 text-[#12829b]" />
        الصفحة الشخصية
      </h1>

      {/* بطاقة المستخدم */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="bg-[#12829b] px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === "MANAGER" ? "bg-white/20 text-white" : "bg-black/20 text-white"
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {user.role === "MANAGER" ? "مدير" : "مستخدم"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">الهاتف</div>
              <div className="text-gray-900 dark:text-gray-100" dir="ltr">{user.phone || "—"}</div>
            </div>
          </div>
          {user.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">البريد</div>
                <div className="text-gray-900 dark:text-gray-100" dir="ltr">{user.email}</div>
              </div>
            </div>
          )}
          {user.job && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">الوظيفة</div>
                <div className="text-gray-900 dark:text-gray-100">{user.job}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* نموذج التعديل */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          تعديل البيانات
        </h3>
        <EditProfileForm
          user={{
            id: user.id,
            name: user.name,
            phone: user.phone,
            whatsapp: user.whatsapp,
            email: user.email,
            job: user.job,
            role: user.role,
          }}
        />
      </div>
    </div>
  );
}
