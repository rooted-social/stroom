"use client";

import { useMemo, useState } from "react";

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

  return (
    <form action={action} className="space-y-3">
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
            placeholder="영문 소문자, 숫자, _ (4~20자)"
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
        <span className="text-sm text-foreground/78">이메일 주소 (인증)</span>
        <input
          name="email"
          type="email"
          required
          className="h-10 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus-visible:border-[#6EA9DD]/60 focus-visible:ring-2 focus-visible:ring-[#6EA9DD]/25"
          placeholder="you@example.com"
        />
      </label>
      <SubmitButton
        label="회원가입"
        pendingLabel="계정 생성 중..."
        className="w-full !border-transparent !bg-gradient-to-r !from-[#6EA9DD] !to-[#3A7BBF] !text-white hover:opacity-90"
        disabled={!isConfirmed}
      />
      {!isConfirmed ? (
        <p className="text-xs text-foreground/58">
          회원가입 전에 아이디 중복 확인을 완료해주세요.
        </p>
      ) : null}
    </form>
  );
}
