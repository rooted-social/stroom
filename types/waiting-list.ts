export type WaitingListPayload = {
  name: string;
  phone?: string;
  email: string;
};

export type WaitingListFieldErrors = Partial<Record<keyof WaitingListPayload, string>>;

export type WaitingListValidationResult = {
  fieldErrors: WaitingListFieldErrors;
  hasError: boolean;
};
