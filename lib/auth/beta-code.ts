export const BETA_CODE = "stroom2026";

export const INVALID_BETA_CODE_MESSAGE = "유효하지 않은 베타 코드입니다.";

export function isValidBetaCode(value: string) {
  return value.trim() === BETA_CODE;
}
