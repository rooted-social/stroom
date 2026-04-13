"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TradeOnboardingPopupProps = {
  userId: string;
};

function getOnboardingCompletedKey(userId: string) {
  return `onboarding_journal_popup_completed:${userId}`;
}

export function TradeOnboardingPopup({ userId }: TradeOnboardingPopupProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkOnboardingTarget() {
      try {
        const completedKey = getOnboardingCompletedKey(userId);
        const isCompleted = window.localStorage.getItem(completedKey) === "true";
        if (isCompleted) {
          return;
        }

        const { count, error: tradesError } = await supabase
          .from("trades")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .limit(1);

        if (tradesError) {
          return;
        }

        if ((count ?? 0) > 0) {
          window.localStorage.setItem(completedKey, "true");
          return;
        }

        if (isMounted) {
          setIsOpen(true);
        }
      } catch {
        // fail-safe: 오류가 발생하면 팝업을 띄우지 않는다.
      }
    }

    void checkOnboardingTarget();

    return () => {
      isMounted = false;
    };
  }, [supabase, userId]);

  function handleDismiss() {
    setIsOpen(false);
  }

  function handleMoveToTrades() {
    setIsOpen(false);
    router.push("/trades");
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
      <div className="w-full max-w-[520px] rounded-xl border border-zinc-200 bg-white px-6 py-7 shadow-2xl dark:border-zinc-700 dark:bg-[#0d1014]">
        <div className="mb-5 flex justify-center">
          <Image
            src="/images/logo_black.png"
            alt="Stroom logo"
            width={136}
            height={40}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/images/logo.png"
            alt="Stroom logo"
            width={136}
            height={40}
            className="hidden h-8 w-auto dark:block"
            priority
          />
        </div>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          스트룸에 오신 것을 환영합니다.
        </h2>
        <p className="mt-2 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
          지금 첫 매매일지를 등록해보세요!
        </p>
        <p className="mx-auto mt-3 max-w-[420px] text-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
          직접 입력한 매매일지를 통해 모든 데이터가 계산되어 나타나요 :)
        </p>

        <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            나중에 할게요
          </button>
          <button
            type="button"
            onClick={handleMoveToTrades}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md border border-zinc-900 bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            매매일지 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
