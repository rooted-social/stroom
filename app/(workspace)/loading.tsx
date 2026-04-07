export default function WorkspaceLoading() {
  return (
    <section className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0d1014]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0d1014]" />
        <div className="h-56 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0d1014]" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0d1014]" />
    </section>
  );
}
