export function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
