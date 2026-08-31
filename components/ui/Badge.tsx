import { ReactNode } from "react";

type BadgeVariant = "default" | "draft" | "generating" | "generated" | "approved" | "published" | "failed" | "info" | "success";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    generating: "bg-sky-50 text-sky-700 border-sky-200 animate-pulse",
    generated: "bg-indigo-50 text-indigo-700 border-indigo-200",
    approved: "bg-teal-50 text-teal-700 border-teal-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const currentStyle = variantStyles[variant.toLowerCase() as BadgeVariant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${currentStyle} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}
