'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import Image from 'next/image';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    setIsPending(false);

    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/');
      router.refresh();
    } else {
      toast.error(result.error || 'حدث خطأ');
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-login-pattern opacity-10 pointer-events-none"></div>
      
      <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full p-2 mb-4 flex items-center justify-center shadow-lg">
            <Image src="/rtx-logo.png" alt="RTX Logo" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm">مرحباً بك في نظام إدارة RTX</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">رقم الهاتف</label>
            <input 
              type="text" 
              name="phone"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
              placeholder="أدخل رقم الهاتف"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                placeholder="أدخل كلمة المرور"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#12829b] text-white py-3 rounded-lg font-bold hover:bg-[#107085] transition-all flex items-center justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
