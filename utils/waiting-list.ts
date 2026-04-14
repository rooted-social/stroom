import type {
  WaitingListFieldErrors,
  WaitingListPayload,
  WaitingListValidationResult,
} from "@/types/waiting-list";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WAITING_LIST_ERROR_MESSAGE = {
  requiredName: "이름을 입력해주세요.",
  requiredEmail: "이메일 주소를 입력해주세요.",
  invalidEmail: "올바른 이메일 형식을 입력해주세요.",
} as const;

export function normalizeWaitingListPayload(payload: Partial<WaitingListPayload>): WaitingListPayload {
  const normalizedPhone = String(payload.phone ?? "").trim();

  return {
    name: String(payload.name ?? "").trim(),
    phone: normalizedPhone ? normalizedPhone : undefined,
    email: String(payload.email ?? "")
      .trim()
      .toLowerCase(),
  };
}

export function validateWaitingListPayload(payload: WaitingListPayload): WaitingListValidationResult {
  const fieldErrors: WaitingListFieldErrors = {};

  if (!payload.name) {
    fieldErrors.name = WAITING_LIST_ERROR_MESSAGE.requiredName;
  }

  if (!payload.email) {
    fieldErrors.email = WAITING_LIST_ERROR_MESSAGE.requiredEmail;
  } else if (!emailPattern.test(payload.email)) {
    fieldErrors.email = WAITING_LIST_ERROR_MESSAGE.invalidEmail;
  }

  return {
    fieldErrors,
    hasError: Object.keys(fieldErrors).length > 0,
  };
}
