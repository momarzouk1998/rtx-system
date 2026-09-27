import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  /** searchParams الحالية (بما فيها q) عشان نحافظ عليها لما نغير الصفحة */
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
}

function buildHref(basePath: string, searchParams: PaginationProps["searchParams"], page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (typeof value === "string" && value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ currentPage, totalPages, totalCount, pageSize, searchParams, basePath }: PaginationProps) {
  if (totalCount === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-gray-200 text-sm">
      <p className="text-gray-500">
        عرض {from}-{to} من {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, currentPage - 1))}
          aria-disabled={currentPage <= 1}
          className={`p-2 rounded-lg border border-gray-200 ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
        <span className="text-gray-600 px-2">
          صفحة {currentPage} من {totalPages}
        </span>
        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage >= totalPages}
          className={`p-2 rounded-lg border border-gray-200 ${currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
