export default function AdminLoading() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-white" />
        ))}
      </div>
      <div className="h-[360px] animate-pulse rounded-xl border border-zinc-200 bg-white" />
    </section>
  );
}
