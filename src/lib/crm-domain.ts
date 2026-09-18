// Client-safe CRM domain constants shared by pages and server functions.

export const JOB_STATUSES = [
  "NEW",
  "TO_QUOTE",
  "AWAITING_WORKSHOP",
  "RECEIVED",
  "INSPECTION",
  "AWAITING_APPROVAL",
  "IN_PROGRESS",
  "AWAITING_QC",
  "READY_FOR_COLLECTION",
  "COLLECTED",
  "COMPLETED",
  "WAITING_FOR_PARTS",
  "CUSTOMER_DECLINED",
  "CANCELLED",
  "RETURNED_TO_WORKSHOP",
  "ON_HOLD",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_LOCATIONS = [
  "FRONT_DESK",
  "WORKSHOP",
  "BENCH_1",
  "BENCH_2",
  "BENCH_3",
  "QC",
] as const;
export type JobLocation = (typeof JOB_LOCATIONS)[number];

export const JOB_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const statusLabels: Record<JobStatus, string> = {
  NEW: "New",
  TO_QUOTE: "To Quote",
  AWAITING_WORKSHOP: "Awaiting Workshop",
  RECEIVED: "Received",
  INSPECTION: "Inspection",
  AWAITING_APPROVAL: "Awaiting Approval",
  IN_PROGRESS: "In Progress",
  AWAITING_QC: "Awaiting QC",
  READY_FOR_COLLECTION: "Ready for Collection",
  COLLECTED: "Collected",
  COMPLETED: "Completed",
  WAITING_FOR_PARTS: "Waiting for Parts",
  CUSTOMER_DECLINED: "Customer Declined",
  CANCELLED: "Cancelled",
  RETURNED_TO_WORKSHOP: "Returned to Workshop",
  ON_HOLD: "On Hold",
};

export const locationLabels: Record<JobLocation, string> = {
  FRONT_DESK: "Front Desk",
  WORKSHOP: "Workshop",
  BENCH_1: "Bench 1",
  BENCH_2: "Bench 2",
  BENCH_3: "Bench 3",
  QC: "QC",
};

export const priorityLabels: Record<JobPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const statusTone: Record<JobStatus, string> = {
  NEW: "blue",
  TO_QUOTE: "violet",
  AWAITING_WORKSHOP: "blue",
  RECEIVED: "blue",
  INSPECTION: "amber",
  AWAITING_APPROVAL: "violet",
  IN_PROGRESS: "green",
  AWAITING_QC: "violet",
  READY_FOR_COLLECTION: "amber",
  COLLECTED: "muted",
  COMPLETED: "muted",
  WAITING_FOR_PARTS: "amber",
  CUSTOMER_DECLINED: "red",
  CANCELLED: "red",
  RETURNED_TO_WORKSHOP: "amber",
  ON_HOLD: "muted",
};

export const toneColor: Record<string, string> = {
  blue: "var(--status-blue)",
  green: "var(--status-green)",
  amber: "var(--status-amber)",
  violet: "var(--status-violet)",
  red: "var(--status-red)",
  muted: "var(--muted-foreground)",
};

/** Statuses that take a job out of the active pipeline. */
export const CLOSED_STATUSES: JobStatus[] = [
  "COMPLETED",
  "COLLECTED",
  "CANCELLED",
  "CUSTOMER_DECLINED",
];

export const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  NEW: ["TO_QUOTE", "AWAITING_WORKSHOP", "ON_HOLD", "CANCELLED"],
  TO_QUOTE: ["AWAITING_APPROVAL", "AWAITING_WORKSHOP", "ON_HOLD", "CANCELLED"],
  AWAITING_WORKSHOP: ["RECEIVED", "TO_QUOTE", "ON_HOLD", "CANCELLED"],
  RECEIVED: ["INSPECTION", "IN_PROGRESS", "AWAITING_APPROVAL", "TO_QUOTE", "ON_HOLD", "CANCELLED"],
  INSPECTION: ["AWAITING_APPROVAL", "TO_QUOTE", "IN_PROGRESS", "WAITING_FOR_PARTS", "ON_HOLD", "CANCELLED"],
  AWAITING_APPROVAL: ["IN_PROGRESS", "CUSTOMER_DECLINED", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["AWAITING_QC", "WAITING_FOR_PARTS", "AWAITING_APPROVAL", "ON_HOLD", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  AWAITING_QC: ["READY_FOR_COLLECTION", "RETURNED_TO_WORKSHOP", "ON_HOLD"],
  RETURNED_TO_WORKSHOP: ["IN_PROGRESS", "AWAITING_QC", "ON_HOLD"],
  READY_FOR_COLLECTION: ["COLLECTED", "RETURNED_TO_WORKSHOP"],
  COLLECTED: ["COMPLETED"],
  COMPLETED: [],
  CUSTOMER_DECLINED: ["READY_FOR_COLLECTION", "CANCELLED"],
  CANCELLED: [],
  ON_HOLD: ["AWAITING_WORKSHOP", "RECEIVED", "IN_PROGRESS", "CANCELLED"],
};

/** Workshop board grouping (Received / In Progress / Quality Check / Ready). */
export const workshopColumns = [
  {
    key: "received",
    title: "Received",
    blurb: "Newly received jobs",
    color: "var(--status-blue)",
    statuses: ["RECEIVED", "INSPECTION"] as JobStatus[],
  },
  {
    key: "progress",
    title: "In Progress",
    blurb: "Being worked on",
    color: "var(--status-green)",
    statuses: ["IN_PROGRESS", "WAITING_FOR_PARTS", "RETURNED_TO_WORKSHOP"] as JobStatus[],
  },
  {
    key: "qc",
    title: "Quality Check",
    blurb: "Final checks before completion",
    color: "var(--status-violet)",
    statuses: ["AWAITING_QC"] as JobStatus[],
  },
  {
    key: "ready",
    title: "Ready",
    blurb: "Collection pending",
    color: "var(--status-amber)",
    statuses: ["READY_FOR_COLLECTION"] as JobStatus[],
  },
] as const;

/** Jobs board grouping (five approved columns). */
export const boardColumns = [
  {
    key: "quote",
    label: "To Quote",
    blurb: "Bespoke and quote-only enquiries",
    color: "var(--status-violet)",
    statuses: ["TO_QUOTE"] as JobStatus[],
  },
  {
    key: "received",
    label: "Received",
    blurb: "New jobs awaiting workshop",
    color: "var(--status-blue)",
    statuses: ["NEW", "AWAITING_WORKSHOP", "RECEIVED", "INSPECTION"] as JobStatus[],
  },
  {
    key: "workshop",
    label: "In Workshop",
    blurb: "Currently being worked on",
    color: "var(--status-amber)",
    statuses: [
      "IN_PROGRESS",
      "WAITING_FOR_PARTS",
      "RETURNED_TO_WORKSHOP",
      "ON_HOLD",
    ] as JobStatus[],
  },
  {
    key: "approval",
    label: "Awaiting Approval",
    blurb: "Waiting for customer approval",
    color: "var(--status-violet)",
    statuses: ["AWAITING_APPROVAL"] as JobStatus[],
  },
  {
    key: "qc",
    label: "Quality Control",
    blurb: "Final checks before collection",
    color: "var(--status-green)",
    statuses: ["AWAITING_QC"] as JobStatus[],
  },
  {
    key: "ready",
    label: "Ready for Collection",
    blurb: "Complete and awaiting collection",
    color: "var(--status-amber)",
    statuses: ["READY_FOR_COLLECTION"] as JobStatus[],
  },
] as const;

/** Job detail progress rail. */
export const progressStages: { label: string; statuses: JobStatus[] }[] = [
  { label: "Received", statuses: ["NEW", "TO_QUOTE", "AWAITING_WORKSHOP", "RECEIVED", "INSPECTION"] },
  {
    label: "In Workshop",
    statuses: ["IN_PROGRESS", "WAITING_FOR_PARTS", "RETURNED_TO_WORKSHOP", "AWAITING_APPROVAL", "ON_HOLD"],
  },
  { label: "Quality Check", statuses: ["AWAITING_QC"] },
  { label: "Ready for Collection", statuses: ["READY_FOR_COLLECTION"] },
  { label: "Completed", statuses: ["COLLECTED", "COMPLETED"] },
];

export type JobDTO = {
  id: string;
  reference: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  clientPostcode: string | null;
  itemType: string;
  itemDescription: string;
  metal: string | null;
  stone: string | null;
  service: string;
  quotedPrice: number | null;
  depositAmount: number | null;
  promisedDate: string | null;
  priority: JobPriority;
  customerNotes: string | null;
  status: JobStatus;
  location: JobLocation;
  acceptedBy: string | null;
  isDraft: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type JobItemDTO = {
  id: string;
  position: number;
  itemType: string;
  service: string;
  metal: string | null;
  stone: string | null;
  description: string;
};

export type ActivityDTO = {
  id: string;
  activityType: string;
  description: string;
  staffName: string | null;
  createdAt: string;
};

export type ClientDTO = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  postcode: string | null;
  notes: string | null;
  createdAt: string;
};

export function money(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `£${Number(value).toFixed(2)}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysOverdue(promised: string | null, status: JobStatus): number {
  if (!promised || CLOSED_STATUSES.includes(status)) return 0;
  const due = new Date(`${promised}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  const diff = Math.floor((Date.now() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}
