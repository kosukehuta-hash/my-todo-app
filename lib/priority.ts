export const PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: PRIORITY.LOW, label: "低" },
  { value: PRIORITY.MEDIUM, label: "中" },
  { value: PRIORITY.HIGH, label: "高" },
];

export function getPriorityLabel(priority: number | null | undefined): string {
  if (priority === PRIORITY.HIGH) return "高";
  if (priority === PRIORITY.MEDIUM) return "中";
  return "低";
}

export function getPriorityClassName(priority: number | null | undefined): string {
  if (priority === PRIORITY.HIGH) {
    return "bg-red-100 text-red-700 ring-red-200";
  }
  if (priority === PRIORITY.MEDIUM) {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}
