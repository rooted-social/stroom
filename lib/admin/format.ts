export function formatDateTime(isoText: string | null) {
  if (!isoText) {
    return "-";
  }
  return new Date(isoText).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
