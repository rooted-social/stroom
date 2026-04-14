"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import type { WaitingListFieldErrors, WaitingListPayload } from "@/types/waiting-list";
import {
  normalizeWaitingListPayload,
  validateWaitingListPayload,
} from "@/utils/waiting-list";

const initialFormValues: WaitingListPayload = {
  name: "",
  email: "",
};

export function WaitingListForm() {
  const [values, setValues] = useState<WaitingListPayload>(initialFormValues);
  const [isPrivacyPolicyAgreed, setIsPrivacyPolicyAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<WaitingListFieldErrors>({});
  const [privacyPolicyError, setPrivacyPolicyError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  function updateField(name: keyof WaitingListPayload, value: string) {
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitError("");
    setFieldErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      return {
        ...previous,
        [name]: undefined,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPrivacyPolicyAgreed) {
      setPrivacyPolicyError("개인정보처리방침 동의가 필요합니다.");
      return;
    }

    setPrivacyPolicyError("");

    const normalizedPayload = normalizeWaitingListPayload(values);
    const validationResult = validateWaitingListPayload(normalizedPayload);
    if (validationResult.hasError) {
      setFieldErrors(validationResult.fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError("");

    try {
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedPayload),
      });

      const data = (await response.json()) as {
        message?: string;
        fieldErrors?: WaitingListFieldErrors;
      };

      if (!response.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setSubmitError(data.message ?? "웨이팅리스트 등록 중 오류가 발생했습니다.");
        return;
      }

      setValues(initialFormValues);
      setFieldErrors({});
      setIsPrivacyPolicyAgreed(false);
      setPrivacyPolicyError("");
      setSubmitError("");
      setIsCompleteModalOpen(true);
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirmComplete() {
    setIsCompleteModalOpen(false);
    setValues(initialFormValues);
    setIsPrivacyPolicyAgreed(false);
    setFieldErrors({});
    setPrivacyPolicyError("");
    setSubmitError("");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-foreground/85">이름</span>
          <input
            name="name"
            required
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
            placeholder="홍길동"
          />
          {fieldErrors.name ? <p className="text-xs text-rose-300">{fieldErrors.name}</p> : null}
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-foreground/85">이메일 주소</span>
          <input
            name="email"
            type="email"
            required
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
            placeholder="name@email.com"
          />
          {fieldErrors.email ? <p className="text-xs text-rose-300">{fieldErrors.email}</p> : null}
        </label>

        <div className="space-y-1.5 rounded-xl border border-white/15 bg-black/15 px-3 py-2.5">
          <label htmlFor="privacy-policy-consent" className="flex cursor-pointer items-start gap-2.5">
            <input
              id="privacy-policy-consent"
              name="privacyPolicyConsent"
              type="checkbox"
              checked={isPrivacyPolicyAgreed}
              onChange={(event) => {
                setIsPrivacyPolicyAgreed(event.target.checked);
                if (event.target.checked) {
                  setPrivacyPolicyError("");
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-white/35 bg-black/20 accent-[#6EA9DD]"
            />
            <span className="text-sm text-foreground/85">
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
          </label>
          {privacyPolicyError ? <p className="text-xs text-rose-300">{privacyPolicyError}</p> : null}
        </div>

        {submitError ? (
          <p className="rounded-xl border border-rose-300/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {submitError}
          </p>
        ) : null}

        <div className="pt-1 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#9BC9EE]/55 bg-[linear-gradient(128deg,#79B7EA_0%,#3A7BBF_58%,#2E639B_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-18px_rgba(58,123,191,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B6DCFA]/75 hover:shadow-[0_24px_46px_-18px_rgba(58,123,191,1)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
            <span className="relative">
              {isSubmitting ? "등록 중..." : "웨이팅리스트 등록하기"}
            </span>
          </button>
        </div>
      </form>

      {isCompleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020711]/65 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="waiting-list-complete-title"
            aria-describedby="waiting-list-complete-description"
            className="w-full max-w-md rounded-2xl border border-[#6EA9DD]/45 bg-[#0f1b2c] p-6 text-center shadow-[0_24px_50px_-26px_rgba(58,123,191,0.65)] animate-in fade-in zoom-in-95 duration-300"
          >
            <h3 id="waiting-list-complete-title" className="text-xl font-semibold text-white">
              등록이 완료되었습니다
            </h3>
            <p id="waiting-list-complete-description" className="mt-3 text-sm text-foreground/75">
              웨이팅리스트에 성공적으로 등록되었어요. 베타 오픈 소식을 가장 먼저 알려드릴게요.
            </p>
            <button
              type="button"
              onClick={handleConfirmComplete}
              className="mt-6 cursor-pointer rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
