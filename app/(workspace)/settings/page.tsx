import { SettingsModalCards } from "@/components/organisms/settings-modal-cards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type JournalSettingsRow = {
  default_leverage: number | null;
  major_symbols: string[] | null;
  scenario_checklists: string[] | null;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { success, error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, email")
    .eq("id", user.id)
    .single();

  const { data: journalSettings } = await supabase
    .from("user_journal_settings")
    .select("default_leverage, major_symbols, scenario_checklists")
    .eq("user_id", user.id)
    .single();

  const defaults = (journalSettings ?? null) as JournalSettingsRow | null;

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">SETTINGS</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          설정
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          프로필과 매매일지 환경을 조정합니다.
        </p>
      </header>
      {success ? (
        <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <SettingsModalCards
        profile={{
          fullName: profile?.full_name ?? "",
          username: profile?.username ?? "",
          email: profile?.email ?? user.email ?? "",
        }}
        journalSettings={{
          defaultLeverage: defaults?.default_leverage ?? 1,
          majorSymbols: defaults?.major_symbols ?? [],
          scenarioChecklists: defaults?.scenario_checklists ?? [],
        }}
      />
    </section>
  );
}
