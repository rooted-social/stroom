import type {
  WaitingListFieldErrors,
  WaitingListPayload,
  WaitingListValidationResult,
} from "@/types/waiting-list";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WAITING_LIST_ERROR_MESSAGE = {
  requiredName: "이름을 입력해주세요.",
  requiredPhone: "연락처를 입력해주세요.",
  requiredEmail: "이메일 주소를 입력해주세요.",
  invalidEmail: "올바른 이메일 형식을 입력해주세요.",
} as const;

export function normalizeWaitingListPayload(payload: Partial<WaitingListPayload>): WaitingListPayload {
  return {
    name: String(payload.name ?? "").trim(),
    phone: String(payload.phone ?? "").trim(),
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

  if (!payload.phone) {
    fieldErrors.phone = WAITING_LIST_ERROR_MESSAGE.requiredPhone;
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
