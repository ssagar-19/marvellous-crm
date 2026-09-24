import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  CLOSED_STATUSES,
  JOB_LOCATIONS,
  JOB_PRIORITIES,
  JOB_STATUSES,
  allowedTransitions,
  statusLabels,
  locationLabels,
  type ActivityDTO,
  type ClientDTO,
  type JobDTO,
  type JobItemDTO,
  type JobStatus,
} from "./crm-domain";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AuthContext = { supabase: SupabaseClient<Database>; claims: Record<string, unknown> };

const JOB_SELECT =
  "id, job_reference, client_id, item_type, item_description, metal, stone, service, quoted_price, deposit_amount, promised_completion_date, priority, customer_notes, status, location, accepted_by, is_draft, created_at, completed_at, marvellous_clients ( id, full_name, phone, email, postcode )";

type RawJob = {
  id: string;
  job_reference: string;
  client_id: string;
  item_type: string;
  item_description: string;
  metal: string | null;
  stone: string | null;
  service: string;
  quoted_price: string | number | null;
  deposit_amount: string | number | null;
  promised_completion_date: string | null;
  priority: string;
  customer_notes: string | null;
  status: string;
  location: string;
  accepted_by: string | null;
  is_draft: boolean;
  created_at: string;
  completed_at: string | null;
  marvellous_clients: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
    postcode: string | null;
  } | null;
};

function num(v: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toJobDTO(row: RawJob): JobDTO {
  return {
    id: row.id,
    reference: row.job_reference,
    clientId: row.client_id,
    clientName: row.marvellous_clients?.full_name ?? "Unknown client",
    clientPhone: row.marvellous_clients?.phone ?? "",
    clientEmail: row.marvellous_clients?.email ?? null,
    clientPostcode: row.marvellous_clients?.postcode ?? null,
    itemType: row.item_type,
    itemDescription: row.item_description,
    metal: row.metal,
    stone: row.stone,
    service: row.service,
    quotedPrice: num(row.quoted_price),
    depositAmount: num(row.deposit_amount),
    promisedDate: row.promised_completion_date,
    priority: (row.priority as JobDTO["priority"]) ?? "NORMAL",
    customerNotes: row.customer_notes,
    status: row.status as JobStatus,
    location: row.location as JobDTO["location"],
    acceptedBy: row.accepted_by,
    isDraft: row.is_draft,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

async function staffName(context: AuthContext) {
  const userId = context.claims["sub"] as string | undefined;
  if (userId) {
    const { data } = await context.supabase
      .from("marvellous_staff_profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    if (data?.full_name) return data.full_name;
  }
  const email = context.claims["email"];
  return typeof email === "string" ? email : "Staff";
}

/* ---------------------------------- jobs --------------------------------- */

export const listJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<JobDTO[]> => {
  const db = context.supabase;
  const { data, error } = await db
    .from("marvellous_jobs")
    .select(JOB_SELECT)
    .eq("is_draft", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawJob[]).map(toJobDTO);
});

export const getJobByRef = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ ref: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<{ job: JobDTO; items: JobItemDTO[]; activity: ActivityDTO[] } | null> => {
    const db = context.supabase;
    const { data: rows, error } = await db
      .from("marvellous_jobs")
      .select(JOB_SELECT)
      .ilike("job_reference", data.ref)
      .limit(1);
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0] as unknown as RawJob | undefined;
    if (!row) return null;

    const { data: acts, error: actError } = await db
      .from("marvellous_job_activity")
      .select("id, activity_type, description, staff_name, created_at")
      .eq("job_id", row.id)
      .order("created_at", { ascending: true });
    if (actError) throw new Error(actError.message);

    const { data: itemRows, error: itemError } = await db
      .from("marvellous_job_items")
      .select("id, position, item_type, service, metal, stone, item_description")
      .eq("job_id", row.id)
      .order("position", { ascending: true });
    if (itemError) throw new Error(itemError.message);

    const items: JobItemDTO[] = (itemRows ?? []).map((i) => ({
      id: i.id,
      position: i.position,
      itemType: i.item_type,
      service: i.service,
      metal: i.metal,
      stone: i.stone,
      description: i.item_description,
    }));

    return {
      job: toJobDTO(row),
      items:
        items.length > 0
          ? items
          : [
              {
                id: row.id,
                position: 1,
                itemType: row.item_type,
                service: row.service,
                metal: row.metal,
                stone: row.stone,
                description: row.item_description,
              },
            ],
      activity: (acts ?? []).map((a) => ({
        id: a.id,
        activityType: a.activity_type,
        description: a.description,
        staffName: a.staff_name,
        createdAt: a.created_at,
      })),
    };
  });

const jobItemSchema = z.object({
  itemType: z.string().trim().min(1, "Each item needs an item type"),
  service: z.string().trim().min(1, "Each item needs a requested service"),
  metal: z.string().trim().optional(),
  stone: z.string().trim().optional().default(""),
  description: z.string().trim().min(1, "Each item needs a description"),
});

const createJobSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  fullName: z.string().trim().min(2, "Customer name is required"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")).optional(),
  postcode: z.string().trim().optional().default(""),
  items: z.array(jobItemSchema).min(1, "Add at least one item to this job"),
  quotedPrice: z.number().nonnegative("Quoted price must be zero or more").nullable().optional(),
  depositAmount: z.number().nonnegative("Deposit must be zero or more").nullable().optional(),
  promisedDate: z.string().trim().min(1, "Promised completion date is required"),
  priority: z.enum(JOB_PRIORITIES),
  customerNotes: z.string().trim().optional().default(""),
  needsQuote: z.boolean().optional().default(false),
  isDraft: z.boolean().optional().default(false),
});

export const createJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createJobSchema.parse(d))
  .handler(async ({ data, context }): Promise<{ reference: string }> => {
    const db = context.supabase;
    const staff = await staffName(context as AuthContext);

    const email = data.email?.trim() ? data.email.trim() : null;
    const postcode = data.postcode?.trim() ? data.postcode.trim() : null;
    const phone = data.phone?.trim() ?? "";
    const first = data.items[0]!;

    let clientId = data.clientId ?? null;
    if (!clientId) {
      const digits = phone.replace(/\D/g, "");
      const { data: existing } = await db
        .from("marvellous_clients")
        .select("id")
        .eq("phone_digits", digits)
        .limit(1);
      clientId = existing?.[0]?.id ?? null;
    }

    if (clientId) {
      await db
        .from("marvellous_clients")
        .update({
          full_name: data.fullName,
          phone,
          email,
          postcode,
        })
        .eq("id", clientId);
    } else {
      const { data: inserted, error } = await db
        .from("marvellous_clients")
        .insert({
          full_name: data.fullName,
          phone,
          email,
          postcode,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      clientId = inserted.id;
    }

    const { data: job, error: jobError } = await db
      .from("marvellous_jobs")
      .insert({
        client_id: clientId,
        item_type: data.items.length > 1 ? `${first.itemType} +${data.items.length - 1}` : first.itemType,
        item_description: first.description,
        metal: first.metal ?? null,
        stone: first.stone?.trim() ? first.stone.trim() : null,
        service: first.service,
        quoted_price: data.quotedPrice ?? null,
        deposit_amount: data.depositAmount ?? null,
        promised_completion_date: data.promisedDate,
        priority: data.priority === "LOW" ? "NORMAL" : data.priority,
        customer_notes: data.customerNotes?.trim() ? data.customerNotes.trim() : null,
        status: data.needsQuote ? "TO_QUOTE" : "AWAITING_WORKSHOP",
        location: "FRONT_DESK",
        accepted_by: staff,
        is_draft: data.isDraft ?? false,
      })
      .select("id, job_reference")
      .single();
    if (jobError) throw new Error(jobError.message);

    const { error: itemsError } = await db.from("marvellous_job_items").insert(
      data.items.map((item, index) => ({
        job_id: job.id,
        position: index + 1,
        item_type: item.itemType,
        service: item.service,
        metal: item.metal ?? null,
        stone: item.stone?.trim() ? item.stone.trim() : null,
        item_description: item.description,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    const itemSummary = data.items.length === 1 ? "1 item" : `${data.items.length} items`;
    await db.from("marvellous_job_activity").insert({
      job_id: job.id,
      activity_type: data.isDraft ? "DRAFT_SAVED" : "CREATED",
      description: data.isDraft
        ? `Draft job ${job.job_reference} saved at the front desk with ${itemSummary}.`
        : `Job ${job.job_reference} created with ${itemSummary}. Status set to ${data.needsQuote ? "To Quote" : "Awaiting Workshop"} at the Front Desk.`,
      staff_name: staff,
    });

    return { reference: job.job_reference };
  });

export const updateJobStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ jobId: z.string().uuid(), status: z.enum(JOB_STATUSES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const staff = await staffName(context as AuthContext);
    const { data: current, error } = await db
      .from("marvellous_jobs")
      .select("id, status, job_reference")
      .eq("id", data.jobId)
      .single();
    if (error) throw new Error(error.message);

    const from = current.status as JobStatus;
    if (from === data.status) return { ok: true };
    if (!allowedTransitions[from].includes(data.status)) {
      throw new Error(
        `Cannot move a job from ${statusLabels[from]} to ${statusLabels[data.status]}.`,
      );
    }

    const closes = data.status === "COMPLETED" || data.status === "COLLECTED";
    const { error: upError } = await db
      .from("marvellous_jobs")
      .update(
        closes
          ? { status: data.status, completed_at: new Date().toISOString() }
          : { status: data.status },
      )
      .eq("id", data.jobId);
    if (upError) throw new Error(upError.message);

    await db.from("marvellous_job_activity").insert({
      job_id: data.jobId,
      activity_type: "STATUS_CHANGE",
      description: `Status changed from ${statusLabels[from]} to ${statusLabels[data.status]}.`,
      staff_name: staff,
    });
    return { ok: true };
  });

export const recordJobQuote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ jobId: z.string().uuid(), quotedPrice: z.number().nonnegative("Enter a valid quote amount") })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const staff = await staffName(context as AuthContext);
    const { data: current, error } = await db
      .from("marvellous_jobs")
      .select("id, status")
      .eq("id", data.jobId)
      .single();
    if (error) throw new Error(error.message);

    const from = current.status as JobStatus;
    if (from !== "TO_QUOTE") {
      throw new Error("A quote can only be recorded while the job is To Quote.");
    }

    const { error: upError } = await db
      .from("marvellous_jobs")
      .update({ quoted_price: data.quotedPrice, status: "AWAITING_APPROVAL" })
      .eq("id", data.jobId);
    if (upError) throw new Error(upError.message);

    await db.from("marvellous_job_activity").insert({
      job_id: data.jobId,
      activity_type: "QUOTE_RECORDED",
      description: `Quote of \u00a3${data.quotedPrice.toFixed(2)} recorded. Sent to the customer for approval.`,
      staff_name: staff,
    });
    return { ok: true };
  });

export const updateJobLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ jobId: z.string().uuid(), location: z.enum(JOB_LOCATIONS) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const staff = await staffName(context as AuthContext);
    const { data: current, error } = await db
      .from("marvellous_jobs")
      .select("id, location")
      .eq("id", data.jobId)
      .single();
    if (error) throw new Error(error.message);
    if (current.location === data.location) return { ok: true };

    const { error: upError } = await db
      .from("marvellous_jobs")
      .update({ location: data.location as any })
      .eq("id", data.jobId);
    if (upError) throw new Error(upError.message);

    await db.from("marvellous_job_activity").insert({
      job_id: data.jobId,
      activity_type: "LOCATION_CHANGE",
      description: `Moved from ${locationLabels[current.location as keyof typeof locationLabels]} to ${locationLabels[data.location]}.`,
      staff_name: staff,
    });
    return { ok: true };
  });

/* -------------------------------- clients -------------------------------- */

export type ClientWithJobs = ClientDTO & {
  jobCount: number;
  openJobCount: number;
  lastJobAt: string | null;
  outstanding: number;
};

export const listClients = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(
  async ({ context }): Promise<ClientWithJobs[]> => {
    const db = context.supabase;
    const { data, error } = await db
      .from("marvellous_clients")
      .select(
        "id, full_name, phone, email, postcode, notes, created_at, marvellous_jobs ( id, status, quoted_price, deposit_amount, created_at )",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((c) => {
      const jobs = (c.marvellous_jobs ?? []) as unknown as {
        id: string;
        status: string;
        quoted_price: string | number | null;
        deposit_amount: string | number | null;
        created_at: string;
      }[];
      const open = jobs.filter((j) => !CLOSED_STATUSES.includes(j.status as JobStatus));
      const outstanding = jobs.reduce(
        (sum, j) => sum + Math.max((num(j.quoted_price) ?? 0) - (num(j.deposit_amount) ?? 0), 0),
        0,
      );
      const lastJobAt = jobs
        .map((j) => j.created_at)
        .sort()
        .at(-1) ?? null;
      return {
        id: c.id,
        fullName: c.full_name,
        phone: c.phone,
        email: c.email,
        postcode: c.postcode,
        notes: c.notes,
        createdAt: c.created_at,
        jobCount: jobs.length,
        openJobCount: open.length,
        lastJobAt,
        outstanding,
      };
    });
  },
);

export const getClient = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ client: ClientDTO; jobs: JobDTO[] } | null> => {
    const db = context.supabase;
    const { data: client, error } = await db
      .from("marvellous_clients")
      .select("id, full_name, phone, email, postcode, notes, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!client) return null;

    const { data: jobs, error: jobsError } = await db
      .from("marvellous_jobs")
      .select(JOB_SELECT)
      .eq("client_id", data.id)
      .order("created_at", { ascending: false });
    if (jobsError) throw new Error(jobsError.message);

    return {
      client: {
        id: client.id,
        fullName: client.full_name,
        phone: client.phone,
        email: client.email,
        postcode: client.postcode,
        notes: client.notes,
        createdAt: client.created_at,
      },
      jobs: ((jobs ?? []) as unknown as RawJob[]).map(toJobDTO),
    };
  });

export const searchClients = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ term: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<ClientDTO[]> => {
    const term = data.term.trim();
    if (term.length < 2) return [];
    const db = context.supabase;
    const digits = term.replace(/\D/g, "");
    const filters = [`full_name.ilike.%${term}%`, `email.ilike.%${term}%`, `postcode.ilike.%${term}%`];
    if (digits.length >= 3) filters.push(`phone_digits.ilike.%${digits}%`);
    const { data: rows, error } = await db
      .from("marvellous_clients")
      .select("id, full_name, phone, email, postcode, notes, created_at")
      .or(filters.join(","))
      .limit(8);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((c) => ({
      id: c.id,
      fullName: c.full_name,
      phone: c.phone,
      email: c.email,
      postcode: c.postcode,
      notes: c.notes,
      createdAt: c.created_at,
    }));
  });

/* --------------------------------- search -------------------------------- */

export type SearchResults = {
  clients: { id: string; name: string; phone: string; email: string | null; postcode: string | null }[];
  jobs: { reference: string; title: string; client: string; status: JobStatus; location: string }[];
};

export const globalSearch = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ term: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<SearchResults> => {
    const term = data.term.trim();
    if (term.length < 2) return { clients: [], jobs: [] };
    const db = context.supabase;
    const digits = term.replace(/\D/g, "");

    const clientFilters = [
      `full_name.ilike.%${term}%`,
      `email.ilike.%${term}%`,
      `postcode.ilike.%${term}%`,
    ];
    if (digits.length >= 3) clientFilters.push(`phone_digits.ilike.%${digits}%`);

    const jobFilters = [
      `job_reference.ilike.%${term}%`,
      `item_description.ilike.%${term}%`,
      `service.ilike.%${term}%`,
      `item_type.ilike.%${term}%`,
    ];
    if (digits.length >= 3) jobFilters.push(`job_reference.ilike.%${digits}%`);

    const [clientsRes, jobsRes] = await Promise.all([
      db
        .from("marvellous_clients")
        .select("id, full_name, phone, email, postcode")
        .or(clientFilters.join(","))
        .limit(6),
      db
        .from("marvellous_jobs")
        .select("job_reference, item_type, service, status, location, marvellous_clients ( full_name )")
        .or(jobFilters.join(","))
        .limit(6),
    ]);

    if (clientsRes.error) throw new Error(clientsRes.error.message);
    if (jobsRes.error) throw new Error(jobsRes.error.message);

    return {
      clients: (clientsRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.full_name,
        phone: c.phone,
        email: c.email,
        postcode: c.postcode,
      })),
      jobs: ((jobsRes.data ?? []) as unknown as {
        job_reference: string;
        item_type: string;
        service: string;
        status: string;
        location: string;
        marvellous_clients: { full_name: string } | null;
      }[]).map((j) => ({
        reference: j.job_reference,
        title: `${j.item_type} — ${j.service}`,
        client: j.marvellous_clients?.full_name ?? "Unknown client",
        status: j.status as JobStatus,
        location: j.location,
      })),
    };
  });

export const locatePiece = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ ref: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const raw = data.ref.trim();
    if (!raw) return null;
    const reference = /^mj-/i.test(raw) ? raw.toUpperCase() : `MJ-${raw.replace(/\D/g, "")}`;
    const db = context.supabase;
    const { data: rows, error } = await db
      .from("marvellous_jobs")
      .select("job_reference, item_type, item_description, status, location, marvellous_clients ( full_name )")
      .ilike("job_reference", reference)
      .limit(1);
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0] as unknown as
      | {
          job_reference: string;
          item_type: string;
          item_description: string;
          status: string;
          location: string;
          marvellous_clients: { full_name: string } | null;
        }
      | undefined;
    if (!row) return null;
    return {
      reference: row.job_reference,
      itemType: row.item_type,
      description: row.item_description,
      status: row.status as JobStatus,
      location: row.location,
      client: row.marvellous_clients?.full_name ?? "Unknown client",
    };
  });
