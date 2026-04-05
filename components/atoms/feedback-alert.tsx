type FeedbackAlertProps = {
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
};

const variantClassMap: Record<FeedbackAlertProps["variant"], string> = {
  success:
    "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900",
  error: "border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-900",
  info: "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white text-zinc-800",
};

export function FeedbackAlert({ variant, title, description }: FeedbackAlertProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${variantClassMap[variant]}`}>
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
    </div>
  );
}
