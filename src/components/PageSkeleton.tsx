/** هيكل تحميل بسيط بيظهر فورًا لحد ما محتوى الصفحة الحقيقي (اللي بيجيب بيانات من الداتابيز) يجهز */
export function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="h-4 w-28 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className="h-9 w-32 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
      </div>
      <div className="h-12 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800" />
      <div className="rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="h-10 bg-gray-100 dark:bg-zinc-800" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800" />
        ))}
      </div>
    </div>
  );
}
