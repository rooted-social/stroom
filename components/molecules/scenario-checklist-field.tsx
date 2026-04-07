"use client";

import { useMemo, useState } from "react";

type ScenarioChecklistFieldProps = {
  items: string[];
};

export function ScenarioChecklistField({ items }: ScenarioChecklistFieldProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [memo, setMemo] = useState("");

  const normalizedItems = useMemo(
    () =>
      items
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    [items],
  );

  const encodedChecklist = useMemo(() => selectedItems.join(", "), [selectedItems]);
  const encodedMemo = useMemo(() => memo.trim(), [memo]);

  function toggleItem(item: string) {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item],
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">시나리오 체크리스트</p>
      {normalizedItems.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          설정에서 체크리스트를 먼저 등록해주세요.
        </p>
      ) : (
        <div className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          {normalizedItems.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
                className="size-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-700 dark:accent-zinc-100"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">추가 메모 (선택)</span>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="체크 항목 외 메모"
        />
      </label>

      <input type="hidden" name="scenarioChecklist" value={encodedChecklist} />
      <input type="hidden" name="memoAdditional" value={encodedMemo} />
    </div>
  );
}
