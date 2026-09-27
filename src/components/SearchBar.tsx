import { Search } from "lucide-react";

interface SearchBarProps {
  basePath: string;
  defaultValue: string;
  placeholder?: string;
}

/** فورم بحث بسيط (GET) - بيشتغل من غير أي JS في المتصفح، ومناسب مع Server Components */
export function SearchBar({ basePath, defaultValue, placeholder = "بحث..." }: SearchBarProps) {
  return (
    <form action={basePath} method="GET" className="relative w-full max-w-xs">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="input-field pr-9 w-full text-sm"
        dir="rtl"
      />
    </form>
  );
}
