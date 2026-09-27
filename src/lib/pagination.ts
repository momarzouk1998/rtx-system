export const PAGE_SIZE = 20;

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** يقرأ رقم الصفحة الحالية (page) من searchParams، بحد أدنى 1 */
export function getCurrentPage(searchParams: RawSearchParams): number {
  const raw = firstValue(searchParams.page);
  const page = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** يقرأ نص البحث (q) من searchParams */
export function getSearchQuery(searchParams: RawSearchParams): string {
  return (firstValue(searchParams.q) ?? "").trim();
}

/** يحسب skip/take لـ Prisma بناءً على رقم الصفحة الحالية */
export function getSkipTake(searchParams: RawSearchParams, pageSize: number = PAGE_SIZE) {
  const page = getCurrentPage(searchParams);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function getTotalPages(totalCount: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
