export type ParsedScenarioChecklist = {
  checklistText: string;
  checklistItems: string[];
  memoText: string;
  exitReasonText: string;
  hasStructuredData: boolean;
};

export function parseScenarioChecklistText(value: string | null): ParsedScenarioChecklist {
  if (!value) {
    return {
      checklistText: "",
      checklistItems: [],
      memoText: "",
      exitReasonText: "",
      hasStructuredData: false,
    };
  }

  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const checklistLine = lines.find((line) => line.startsWith("체크리스트:"));
  const memoLine = lines.find((line) => line.startsWith("추가 메모:"));
  const exitReasonLine = lines.find((line) => line.startsWith("탈출 근거:"));

  if (!checklistLine && !memoLine && !exitReasonLine) {
    return {
      checklistText: value.trim(),
      checklistItems: [],
      memoText: "",
      exitReasonText: "",
      hasStructuredData: false,
    };
  }

  const checklistText = checklistLine
    ? checklistLine.replace("체크리스트:", "").trim()
    : "";
  const checklistItems = checklistText
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return {
    checklistText,
    checklistItems,
    memoText: memoLine ? memoLine.replace("추가 메모:", "").trim() : "",
    exitReasonText: exitReasonLine ? exitReasonLine.replace("탈출 근거:", "").trim() : "",
    hasStructuredData: true,
  };
}
