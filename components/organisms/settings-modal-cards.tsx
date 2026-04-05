"use client";

import { useEffect, useMemo, useState } from "react";

import {
  updateJournalDefaultsAction,
  updateProfileSettingsAction,
} from "@/app/(workspace)/settings/actions";

type SettingsModalCardsProps = {
  profile: {
    fullName: string;
    username: string;
    email: string;
  };
  journalSettings: {
    defaultLeverage: number;
    majorSymbols: string[];
    scenarioChecklists: string[];
  };
};

type ModalType = "profile" | "journal" | null;

export function SettingsModalCards({ profile, journalSettings }: SettingsModalCardsProps) {
  const [mountedModal, setMountedModal] = useState<ModalType>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [symbols, setSymbols] = useState<string[]>(
    journalSettings.majorSymbols.length > 0 ? journalSettings.majorSymbols : [""],
  );
  const [checklists, setChecklists] = useState<string[]>(
    journalSettings.scenarioChecklists.length > 0 ? journalSettings.scenarioChecklists : [""],
  );

  const symbolsJson = useMemo(() => JSON.stringify(symbols), [symbols]);
  const checklistJson = useMemo(() => JSON.stringify(checklists), [checklists]);

  function openModal(type: Exclude<ModalType, null>) {
    setMountedModal(type);
    requestAnimationFrame(() => setIsModalVisible(true));
  }

  function closeModal() {
    setIsModalVisible(false);
  }

  useEffect(() => {
    if (!mountedModal) {
      return;
    }

    if (!isModalVisible) {
      const timer = window.setTimeout(() => {
        setMountedModal(null);
      }, 180);

      return () => window.clearTimeout(timer);
    }
  }, [isModalVisible, mountedModal]);

  function updateListValue(
    list: string[],
    setList: (next: string[]) => void,
    index: number,
    value: string,
  ) {
    const next = [...list];
    next[index] = value;
    setList(next);
  }

  function removeListValue(list: string[], setList: (next: string[]) => void, index: number) {
    if (list.length <= 1) {
      setList([""]);
      return;
    }

    setList(list.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => openModal("profile")}
          className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-[#101317]"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">PROFILE</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            프로필 설정
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            이름과 아이디를 관리합니다.
          </p>
        </button>

        <button
          type="button"
          onClick={() => openModal("journal")}
          className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-[#101317]"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">TRADING JOURNAL</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            매매일지 설정
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            주요 종목, 시나리오 체크리스트, 기본 레버리지를 설정합니다.
          </p>
        </button>
      </div>

      {mountedModal === "profile" ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl transition-all duration-200 dark:border-zinc-700 dark:bg-[#0d1014] ${
              isModalVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">PROFILE</p>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  프로필 설정
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              >
                닫기
              </button>
            </div>

            <form action={updateProfileSettingsAction} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">이름</span>
                <input
                  name="fullName"
                  defaultValue={profile.fullName}
                  required
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">아이디</span>
                <input
                  defaultValue={profile.username}
                  disabled
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm lowercase text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">이메일</span>
                <input
                  defaultValue={profile.email}
                  disabled
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 outline-none dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-zinc-900 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                저장
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {mountedModal === "journal" ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl transition-all duration-200 dark:border-zinc-700 dark:bg-[#0d1014] ${
              isModalVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
                  TRADING JOURNAL
                </p>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  매매일지 설정
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              >
                닫기
              </button>
            </div>

            <form action={updateJournalDefaultsAction} className="space-y-4">
              <section className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  주요 매매 종목
                </h4>
                {symbols.map((item, index) => (
                  <div key={`symbol-${index}`} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(event) =>
                        updateListValue(symbols, setSymbols, index, event.target.value.toUpperCase())
                      }
                      className="h-9 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm uppercase text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="예: BTC"
                    />
                    <button
                      type="button"
                      onClick={() => removeListValue(symbols, setSymbols, index)}
                      className="h-9 cursor-pointer rounded-lg border border-zinc-300 px-3 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSymbols((prev) => [...prev, ""])}
                  className="h-8 cursor-pointer rounded-lg border border-zinc-300 px-3 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  종목 추가
                </button>
              </section>

              <section className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  시나리오 체크리스트
                </h4>
                {checklists.map((item, index) => (
                  <div key={`check-${index}`} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(event) =>
                        updateListValue(checklists, setChecklists, index, event.target.value)
                      }
                      className="h-9 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="예: 주요 저항/지지 확인"
                    />
                    <button
                      type="button"
                      onClick={() => removeListValue(checklists, setChecklists, index)}
                      className="h-9 cursor-pointer rounded-lg border border-zinc-300 px-3 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setChecklists((prev) => [...prev, ""])}
                  className="h-8 cursor-pointer rounded-lg border border-zinc-300 px-3 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  체크리스트 추가
                </button>
              </section>

              <label className="block space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">기본 레버리지</span>
                <input
                  name="defaultLeverage"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  required
                  defaultValue={journalSettings.defaultLeverage}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>

              <input type="hidden" name="majorSymbolsJson" value={symbolsJson} />
              <input type="hidden" name="scenarioChecklistsJson" value={checklistJson} />

              <button
                type="submit"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-zinc-900 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                저장
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
