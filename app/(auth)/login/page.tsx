import Link from "next/link";

import { loginAction } from "@/app/(auth)/actions";
import { FeedbackAlert } from "@/components/atoms/feedback-alert";
import { GaEventOnMount } from "@/components/analytics/ga-event-on-mount";
import { SubmitButton } from "@/components/atoms/submit-button";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    successTitle?: string;
    successDescription?: string;
    ga_signup?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, success, successTitle, successDescription, ga_signup } = await searchParams;

  return (
    <main className="space-y-6 text-foreground">
      <GaEventOnMount eventName="sign_up" enabled={ga_signup === "1"} queryParamToRemove="ga_signup" />
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="text-sm text-foreground/70">
          스트룸 - 매매일지 및 트레이딩 관리 시스템
        </p>
      </header>
      {error ? (
        <FeedbackAlert variant="error" title="로그인에 실패했습니다." description={error} />
      ) : null}
      {successTitle || success ? (
        <FeedbackAlert
          variant="success"
          title={successTitle ?? "안내"}
          description={successDescription ?? success}
        />
      ) : null}
      <form action={loginAction} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm text-foreground/78">아이디</span>
          <input
            name="identifier"
            type="text"
            required
            className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
            placeholder="아이디 또는 이메일"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-foreground/78">비밀번호</span>
          <input
            name="password"
            type="password"
            required
            className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
            placeholder="******"
          />
        </label>
        <SubmitButton
          label="로그인"
          pendingLabel="로그인 중..."
          className="w-full !border-transparent !bg-gradient-to-r !from-[#6EA9DD] !to-[#3A7BBF] !text-white hover:opacity-90"
        />
      </form>
      <p className="text-center text-sm text-foreground/72">
        계정이 없나요?{" "}
        <Link href="/signup" className="px-0 text-sm font-medium text-hero-heading underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </main>
  );
}
