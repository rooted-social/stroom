type AdminMetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function AdminMetricCard({ label, value, description }: AdminMetricCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
      {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
    </article>
  );
}
