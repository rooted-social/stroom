"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { SubmitButton } from "@/components/atoms/submit-button";

type SignupFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

type UsernameCheckState = "idle" | "checking" | "available" | "taken" | "invalid";

const usernamePattern = /^[a-z0-9_]{4,20}$/;

export function SignupForm({ action }: SignupFormProps) {
  const [username, setUsername] = useState("");
  const [checkState, setCheckState] = useState<UsernameCheckState>("idle");
  const [checkMessage, setCheckMessage] = useState("");
  const [confirmedUsername, setConfirmedUsername] = useState("");
  const [isPrivacyPolicyAgreed, setIsPrivacyPolicyAgreed] = useState(false);

  const normalizedUsername = useMemo(
    () => username.trim().toLowerCase(),
    [username],
  );

  const isConfirmed =
    checkState === "available" &&
    normalizedUsername.length > 0 &&
    normalizedUsername === confirmedUsername;

  async function handleCheckUsername() {
    if (!usernamePattern.test(normalizedUsername)) {
      setCheckState("invalid");
      setCheckMessage("아이디는 4~20자의 영문 소문자, 숫자, 밑줄(_)만 가능합니다.");
      setConfirmedUsername("");
      return;
    }

    setCheckState("checking");
    setCheckMessage("");

    try {
      const response = await fetch(
        `/api/auth/check-username?username=${encodeURIComponent(normalizedUsername)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const data = (await response.json()) as { available: boolean; message: string };

      if (data.available) {
        setCheckState("available");
        setCheckMessage(data.message);
        setConfirmedUsername(normalizedUsername);
        return;
      }

      setCheckState("taken");
      setCheckMessage(data.message);
      setConfirmedUsername("");
    } catch {
      setCheckState("idle");
      setCheckMessage("중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setConfirmedUsername("");
    }
  }

  function handleUsernameChange(value: string) {
    const nextValue = value.toLowerCase();
    setUsername(nextValue);

    if (confirmedUsername && confirmedUsername !== nextValue.trim()) {
      setConfirmedUsername("");
      setCheckState("idle");
      setCheckMessage("");
      return;
    }

    if (checkState !== "idle") {
      setCheckState("idle");
      setCheckMessage("");
    }
  }

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    if (isPrivacyPolicyAgreed) {
      return;
    }
    event.preventDefault();
  }

  return (
    <form action={action} className="space-y-3" onSubmit={handleSignupSubmit}>
      <label className="block space-y-1">
        <span className="text-sm text-foreground/78">이름</span>
        <input
          name="fullName"
          type="text"
          required
          className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
          placeholder="홍길동"
        />
      </label>

      <div className="space-y-1">
        <span className="text-sm text-foreground/78">아이디</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <input
            name="username"
            type="text"
            value={username}
            onChange={(event) => handleUsernameChange(event.target.value)}
            required
            className="h-10 flex-1 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
            placeholder="영문 소문자, 숫자 (4자 이상)"
          />
          <button
            type="button"
            onClick={handleCheckUsername}
            disabled={checkState === "checking"}
            className={[
              "h-10 w-full cursor-pointer rounded-lg border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 sm:min-w-[92px] sm:w-auto",
              isConfirmed
                ? "border-emerald-400/45 bg-emerald-500/16 text-emerald-200"
                : "border-white/12 bg-white/[0.03] text-foreground/82 hover:bg-white/[0.08]",
            ].join(" ")}
          >
            {isConfirmed ? "확인됨" : checkState === "checking" ? "확인 중..." : "중복 확인"}
          </button>
        </div>
        {checkMessage ? (
          <p
            className={`text-xs ${
              isConfirmed
                ? "text-emerald-600"
                : checkState === "taken" || checkState === "invalid"
                  ? "text-rose-600"
                  : "text-foreground/58"
            }`}
          >
            {checkMessage}
          </p>
        ) : null}
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-foreground/78">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
          placeholder="6자 이상"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-foreground/78">비밀번호 확인</span>
        <input
          name="passwordConfirm"
          type="password"
          required
          minLength={6}
          className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
          placeholder="비밀번호를 다시 입력"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-foreground/78">이메일 주소 (가입 후, 인증 메일이 발송됩니다.)</span>
        <input
          name="email"
          type="email"
          required
          className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
          placeholder="you@example.com"
        />
      </label>
      <label
        htmlFor="privacy-policy-consent"
        className="group flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-foreground/78"
      >
        <span className="relative mt-0.5 inline-flex">
          <input
            id="privacy-policy-consent"
            name="privacyPolicyConsent"
            type="checkbox"
            required
            checked={isPrivacyPolicyAgreed}
            onChange={(event) => setIsPrivacyPolicyAgreed(event.target.checked)}
            className="peer sr-only"
          />
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/30 bg-white/[0.04] text-white/90 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.9)] transition-all duration-200 group-hover:border-[#8EC5F0]/70 group-hover:bg-white/[0.08] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6EA9DD]/45 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:border-[#7FBCEB] peer-checked:bg-gradient-to-br peer-checked:from-[#82C2F2] peer-checked:to-[#3A7BBF]">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5 scale-75 opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
            >
              <path
                d="M5 10.5L8.2 13.7L15 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
        <span>
          <span>
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-[#B6DCFA]"
            >
              개인정보처리방침
            </Link>
            에 동의합니다. (필수)
          </span>
        </span>
      </label>
      <SubmitButton
        label="회원가입"
        pendingLabel="계정 생성 중..."
        className="w-full !border-transparent !bg-gradient-to-r !from-[#6EA9DD] !to-[#3A7BBF] !text-white hover:opacity-90"
        disabled={!isConfirmed || !isPrivacyPolicyAgreed}
      />
      {!isConfirmed || !isPrivacyPolicyAgreed ? (
        <p className="text-xs text-foreground/58">
          회원가입 전에 아이디 중복 확인과 개인정보처리방침 동의를 완료해주세요.
        </p>
      ) : null}
    </form>
  );
}
