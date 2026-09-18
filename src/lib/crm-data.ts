export type StatusKey =
  | "received"
  | "workshop"
  | "approval"
  | "qc"
  | "ready";

export const statusMeta: Record<
  StatusKey,
  { label: string; blurb: string; color: string }
> = {
  received: {
    label: "Received",
    blurb: "New jobs awaiting workshop",
    color: "var(--status-blue)",
  },
  workshop: {
    label: "In Workshop",
    blurb: "Currently being worked on",
    color: "var(--status-amber)",
  },
  approval: {
    label: "Awaiting Approval",
    blurb: "Waiting for customer approval",
    color: "var(--status-violet)",
  },
  qc: {
    label: "Quality Control",
    blurb: "Final checks before collection",
    color: "var(--status-green)",
  },
  ready: {
    label: "Ready for Collection",
    blurb: "Complete and awaiting collection",
    color: "var(--status-amber)",
  },
};

export type Job = {
  ref: string;
  title: string;
  customer: string;
  phone: string;
  due: string;
  status: StatusKey;
  location: string;
  item: string;
  service: string;
};

export const jobs: Job[] = [
  { ref: "MJ-25091", title: "Ring Resize", customer: "Sarah Hamilton", phone: "07700 900123", due: "15 Sep 2025", status: "received", location: "Intake", item: "Ring", service: "Resize (Down)" },
  { ref: "MJ-25092", title: "Chain Repair", customer: "Michael Brown", phone: "07533 778900", due: "16 Sep 2025", status: "received", location: "Intake", item: "Chain", service: "Repair" },
  { ref: "MJ-25093", title: "Watch Battery", customer: "Emma Collins", phone: "07890 112233", due: "17 Sep 2025", status: "received", location: "Intake", item: "Watch", service: "Battery" },
  { ref: "MJ-25088", title: "Stone Replacement", customer: "David Wilson", phone: "07912 654321", due: "12 Sep 2025", status: "workshop", location: "Bench 2", item: "Ring", service: "Stone replacement" },
  { ref: "MJ-25087", title: "Bracelet Resize", customer: "Priya Shah", phone: "07854 332211", due: "13 Sep 2025", status: "workshop", location: "Bench 1", item: "Bracelet", service: "Resize" },
  { ref: "MJ-25085", title: "Ring Polish", customer: "James Carter", phone: "07766 112244", due: "14 Sep 2025", status: "workshop", location: "Bench 3", item: "Ring", service: "Polish" },
  { ref: "MJ-25083", title: "Engraving", customer: "Laura Mitchell", phone: "07955 667788", due: "14 Sep 2025", status: "workshop", location: "Bench 4", item: "Pendant", service: "Engraving" },
  { ref: "MJ-25080", title: "Valuation", customer: "Robert Evans", phone: "07801 223344", due: "10 Sep 2025", status: "approval", location: "Office", item: "Emerald ring", service: "Valuation" },
  { ref: "MJ-25078", title: "Design Approval", customer: "Sophie Turner", phone: "07721 334455", due: "11 Sep 2025", status: "approval", location: "Office", item: "Ring", service: "Bespoke design" },
  { ref: "MJ-25076", title: "Ring Resize", customer: "Daniel Harris", phone: "07411 998877", due: "10 Sep 2025", status: "qc", location: "QC Bench", item: "Ring", service: "Resize" },
  { ref: "MJ-25074", title: "Clasp Repair", customer: "Olivia White", phone: "07788 445566", due: "11 Sep 2025", status: "qc", location: "QC Bench", item: "Necklace", service: "Clasp repair" },
  { ref: "MJ-25072", title: "Watch Service", customer: "Thomas Green", phone: "07832 112233", due: "12 Sep 2025", status: "qc", location: "QC Bench", item: "Watch", service: "Full service" },
  { ref: "MJ-25070", title: "Ring Clean & Polish", customer: "Natalie Brooks", phone: "07422 556677", due: "9 Sep 2025", status: "ready", location: "Collection", item: "Ring", service: "Clean & polish" },
  { ref: "MJ-25069", title: "Chain Repair", customer: "Alex Morgan", phone: "07931 123456", due: "9 Sep 2025", status: "ready", location: "Collection", item: "Chain", service: "Repair" },
  { ref: "MJ-25068", title: "Watch Battery", customer: "Hannah Lewis", phone: "07544 998877", due: "10 Sep 2025", status: "ready", location: "Collection", item: "Watch", service: "Battery" },
  { ref: "MJ-25066", title: "Earring Repair", customer: "George Clarke", phone: "07890 556677", due: "10 Sep 2025", status: "ready", location: "Collection", item: "Earrings", service: "Repair" },
  { ref: "MJ-25064", title: "Ring Resize", customer: "Charlotte Hall", phone: "07712 345678", due: "11 Sep 2025", status: "ready", location: "Collection", item: "Ring", service: "Resize" },
];

export const workQueue = [
  { ref: "MJ-24082", customer: "Sarah Hamilton", phone: "07700 900123", item: "Emerald ring", service: "Stone replacement", location: "QC Bench", due: "Today 5:00pm", status: "Quality control", tone: "violet", urgent: true },
  { ref: "MJ-24087", customer: "Anita Mehra", phone: "07854 332211", item: "Platinum solitaire", service: "Ring resize", location: "Bench 2", due: "12 Sep", status: "In progress", tone: "blue", urgent: false },
  { ref: "MJ-24091", customer: "James Patel", phone: "07912 654321", item: "Omega Seamaster", service: "Watch service", location: "Inspection", due: "14 Sep", status: "Inspection", tone: "amber", urgent: false },
  { ref: "MJ-24095", customer: "Lucy Thompson", phone: "07533 778900", item: "Diamond pendant", service: "Claw retip", location: "Bench 1", due: "16 Sep", status: "In progress", tone: "blue", urgent: false },
  { ref: "MJ-24098", customer: "Robert Bailey", phone: "07890 112233", item: "Gold chain", service: "Chain repair", location: "Intake", due: "17 Sep", status: "Awaiting inspection", tone: "amber", urgent: false },
] as const;

export const overdue = [
  { ref: "MJ-24070", customer: "Emma Clarke", service: "Ring resize", due: "12 Sep", days: 6 },
  { ref: "MJ-24073", customer: "Nick Ahmed", service: "Watch service", due: "13 Sep", days: 5 },
  { ref: "MJ-24076", customer: "Sophie Turner", service: "Bracelet repair", due: "15 Sep", days: 3 },
];

export const outlook = [
  { title: "New repair booking", who: "Sarah Hamilton", body: "Ring resize enquiry — would like a quote please…", when: "2 min ago", tone: "amber" },
  { title: "Repair approval", who: "James Patel", body: "Please proceed with the watch service. Thank you!", when: "18 min ago", tone: "red" },
  { title: "Customer enquiry", who: "Lucy Thompson", body: "Just checking whether my item is ready for collection…", when: "42 min ago", tone: "amber" },
  { title: "Booking request", who: "Mark Wilson", body: "Looking to book in a bracelet repair next week…", when: "1 hour ago", tone: "muted" },
];

export const clientGroups = [
  {
    key: "recents",
    title: "Recents",
    count: 12,
    blurb: "Clients in store in the last 7 days",
    color: "var(--status-blue)",
    columns: ["Name", "Phone", "Postcode", "Last Visit"],
    rows: [
      ["Sophie Brown", "07712 345678", "M3 4PL", "Today"],
      ["James Dunn", "07931 123456", "WA14 2QG", "Today"],
      ["Emma Lewis", "07544 998877", "SK8 1AA", "Yesterday"],
      ["Ryan Turner", "07890 112233", "M20 6BX", "2 days ago"],
      ["Natalie Power", "07422 556677", "CH64 8AF", "3 days ago"],
    ],
  },
  {
    key: "exchange",
    title: "In Exchange",
    count: 8,
    blurb: "Clients with items currently in exchange",
    color: "var(--status-green)",
    columns: ["Name", "Phone", "Postcode", "Exchange Date"],
    rows: [
      ["Michael Carter", "07733 445566", "L18 9HF", "10 Sep 2025"],
      ["Aisha Patel", "07814 667788", "M14 5DL", "11 Sep 2025"],
      ["Daniel Lee", "07909 334455", "WA15 7QJ", "12 Sep 2025"],
      ["Hannah Clarke", "07521 889900", "SK7 3EX", "13 Sep 2025"],
      ["Tom Richards", "07766 221133", "M3 7FT", "14 Sep 2025"],
    ],
  },
  {
    key: "awaiting",
    title: "Awaiting Item",
    count: 6,
    blurb: "Clients expected to bring in an item",
    color: "var(--status-violet)",
    columns: ["Name", "Phone", "Postcode", "Expected Date"],
    rows: [
      ["Kieran White", "07766 112244", "M3 7FT", "10 Sep 2025"],
      ["Lauren Smith", "07955 667788", "WA14 9DF", "11 Sep 2025"],
      ["Robert Black", "07801 223344", "M20 2DL", "12 Sep 2025"],
      ["Samantha Green", "07721 334455", "SK8 4HG", "13 Sep 2025"],
      ["Adam Hussain", "07411 998877", "M14 6PL", "15 Sep 2025"],
    ],
  },
  {
    key: "invoiced",
    title: "Invoiced / Awaiting Payment",
    count: 7,
    blurb: "Clients with unpaid invoices",
    color: "var(--status-amber)",
    columns: ["Name", "Phone", "Postcode", "Amount"],
    rows: [
      ["David Khan", "07788 445566", "M14 6PL", "£220.00"],
      ["Samantha Fox", "07832 112233", "SK8 4HG", "£95.00"],
      ["Mark Wilson", "07544 998811", "WA15 2BG", "£480.00"],
      ["Chloe Taylor", "07721 334455", "M3 9DQ", "£75.00"],
      ["George Martin", "07890 556677", "L20 4AB", "£150.00"],
    ],
  },
];
