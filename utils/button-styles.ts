import { cn } from "@/lib/utils";

type LinkButtonVariant = "default" | "outline" | "ghost" | "link";
type LinkButtonSize = "default" | "lg";

const baseClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none";

const variantClassMap: Record<LinkButtonVariant, string> = {
  default:
    "border-transparent bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  outline:
    "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
  ghost:
    "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
  link:
    "border-transparent text-zinc-800 underline-offset-4 hover:underline dark:text-zinc-200",
};

const sizeClassMap: Record<LinkButtonSize, string> = {
  default: "h-8 px-2.5",
  lg: "h-9 px-3",
};

export function linkButtonClass(
  variant: LinkButtonVariant = "default",
  size: LinkButtonSize = "default",
  className?: string,
) {
  return cn(baseClass, variantClassMap[variant], sizeClassMap[size], className);
}
