"use client";

import { type FormEvent, useState } from "react";

import type { WaitingListFieldErrors, WaitingListPayload } from "@/types/waiting-list";
import {
  normalizeWaitingListPayload,
  validateWaitingListPayload,
} from "@/utils/waiting-list";

const initialFormValues: WaitingListPayload = {
  name: "",
  phone: "",
  email: "",
};

export function WaitingListForm() {
  const [values, setValues] = useState<WaitingListPayload>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<WaitingListFieldErrors>({});
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
    setFieldErrors({});
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
          <span className="text-sm text-foreground/85">연락처</span>
          <input
            name="phone"
            required
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
            placeholder="010-1234-5678"
          />
          {fieldErrors.phone ? <p className="text-xs text-rose-300">{fieldErrors.phone}</p> : null}
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

        {submitError ? (
          <p className="rounded-xl border border-rose-300/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {submitError}
          </p>
        ) : null}

        <div className="pt-1 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "등록 중..." : "웨이팅리스트 등록하기"}
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
