import type { z } from "zod";
import type { updateBespokeSchema } from "./bespoke-update-schema";

type BespokeUpdate = z.infer<typeof updateBespokeSchema>;
export type ProjectRow = {
  project_reference: string;
  updated_at: string | null;
  client_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  project_name: string | null;
  piece_type: string | null;
  brief: string | null;
  research: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  status: string;
};
type UpdateResult = {
  data: ProjectRow | null;
  error: { message: string } | null;
};
type UpdateQuery = {
  eq(column: string, value: string): UpdateQuery;
  select(columns: string): {
    maybeSingle(): Promise<UpdateResult>;
  };
};
export type BespokeUpdateDb = {
  from(table: "marvellous_bespoke_projects"): {
    update(values: Record<string, string | null>): UpdateQuery;
  };
};

export async function saveBespokeProject(db: BespokeUpdateDb, data: BespokeUpdate) {
  const { data: project, error } = await db
    .from("marvellous_bespoke_projects")
    .update({
      client_id: data.clientId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      project_name: data.projectName,
      piece_type: data.pieceType,
      brief: data.brief,
      research: data.research,
      notes: data.notes,
      next_action: data.nextAction,
      next_action_date: data.nextActionDate || null,
      status: data.status.toUpperCase(),
    })
    .eq("project_reference", data.reference)
    .eq("updated_at", data.expectedUpdatedAt)
    .select(
      "project_reference, updated_at, client_id, full_name, phone, email, project_name, piece_type, brief, research, notes, next_action, next_action_date, status",
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!project) {
    throw new Error(
      "This project changed since you opened it, or you do not have permission to update it. Reload before saving.",
    );
  }
  if (typeof project.updated_at !== "string" || project.updated_at === data.expectedUpdatedAt) {
    throw new Error(
      "The project was updated, but its updated-at timestamp did not advance. Disable saves and verify the database trigger.",
    );
  }
  return project;
}
