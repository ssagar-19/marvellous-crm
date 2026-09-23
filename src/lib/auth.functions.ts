import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const APP_ROLES = ["admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
};

export type StaffAccess = {
  userId: string;
  email: string;
  fullName: string;
  roles: AppRole[];
};

/* ------------------------------- signup ---------------------------------- */

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  inviteCode: z.string().trim().min(3, "A referral code is required"),
});

export const verifyInviteCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        inviteCode: z.string().trim().min(3),
        email: z.string().trim().email("Enter a valid work email"),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; role: AppRole }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.inviteCode.trim().toUpperCase();

    const { data: invite, error } = await supabaseAdmin
      .from("marvellous_invite_codes")
      .select("role, authorised_email, expires_at, revoked_at, used_at")
      .eq("code", code)
      .maybeSingle();

    if (error || !invite) throw new Error("That referral code is not recognised.");
    if (invite.revoked_at) throw new Error("That referral code has been revoked.");
    if (invite.used_at) throw new Error("That referral code has already been used.");
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      throw new Error("That referral code has expired.");
    }
    if (invite.authorised_email.toLowerCase() !== data.email.trim().toLowerCase()) {
      throw new Error("That referral code is not authorised for this email address.");
    }

    return { ok: true, role: invite.role as AppRole };
  });

/**
 * Invite-only staff onboarding. Public sign-up is disabled at the auth
 * provider, so accounts can only be created through a valid invite code.
 */
export const staffSignUp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => signUpSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; role: AppRole }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.inviteCode.trim().toUpperCase();

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("marvellous_invite_codes")
      .select("id, role, authorised_email, expires_at, revoked_at, used_at")
      .eq("code", code)
      .maybeSingle();
    if (inviteError) throw new Error("Could not verify that referral code.");
    if (!invite) throw new Error("That referral code is not recognised.");
    if (invite.revoked_at) throw new Error("That referral code has been revoked.");
    if (invite.used_at) throw new Error("That referral code has already been used.");
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      throw new Error("That referral code has expired.");
    }
    if (invite.authorised_email.toLowerCase() !== data.email.trim().toLowerCase()) {
      throw new Error("That referral code is not authorised for this email address.");
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      user_metadata: { full_name: data.fullName },
    });
    if (createError || !created?.user) {
      throw new Error(createError?.message ?? "Could not create that account.");
    }

    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("marvellous_staff_profiles").insert({
      id: userId,
      full_name: data.fullName,
      email: data.email,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Could not create the staff profile.");
    }

    // Role comes from the invite only - never from anything the user sends.
    const { error: roleError } = await supabaseAdmin
      .from("marvellous_user_roles")
      .insert({ user_id: userId, role: invite.role });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Could not assign the staff role.");
    }

    const { data: claimedInvite, error: claimError } = await supabaseAdmin
      .from("marvellous_invite_codes")
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq("id", invite.id)
      .is("used_at", null)
      .select("id")
      .maybeSingle();

    if (claimError || !claimedInvite) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("That referral code has already been used.");
    }

    return { ok: true, role: invite.role as AppRole };
  });

/* ------------------------------ my access -------------------------------- */

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffAccess> => {
    const userId = context.userId;
    const email = (context.claims["email"] as string | undefined) ?? "";

    const [{ data: profile }, { data: roles }] = await Promise.all([
      context.supabase.from("marvellous_staff_profiles").select("full_name").eq("id", userId).maybeSingle(),
      context.supabase.from("marvellous_user_roles").select("role").eq("user_id", userId),
    ]);

    return {
      userId,
      email,
      fullName: profile?.full_name ?? email,
      roles: (roles ?? []).map((r) => r.role as AppRole),
    };
  });

/* ----------------------------- admin: staff ------------------------------ */

async function assertAdmin(context: { supabase: any; userId: string }) {
  // Role check via RLS-protected user_roles (own rows are readable by the user).
  const { data, error } = await context.supabase
    .from("marvellous_user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin access required.");
}

export type StaffAccount = {
  id: string;
  fullName: string;
  email: string;
  roles: AppRole[];
  createdAt: string;
};

export const listStaffAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffAccount[]> => {
    await assertAdmin(context as never);
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      context.supabase
        .from("marvellous_staff_profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: true }),
      context.supabase.from("marvellous_user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);
    return (profiles ?? []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      createdAt: p.created_at,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
    }));
  });

/* --------------------------- admin: invite codes -------------------------- */

export type InviteCode = {
  id: string;
  code: string;
  role: AppRole;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  usedAt: string | null;
};

export const listInviteCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InviteCode[]> => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("marvellous_invite_codes")
      .select("id, code, role, created_at, expires_at, revoked_at, used_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((c) => ({
      id: c.id,
      code: c.code,
      role: c.role as AppRole,
      createdAt: c.created_at,
      expiresAt: c.expires_at,
      revokedAt: c.revoked_at,
      usedAt: c.used_at,
    }));
  });

function randomCode() {
  const body = Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
  ).join("");
  return `MJ-${body}`;
}

export const createInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ code: string }> => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = randomCode();
    const { error } = await supabaseAdmin.from("marvellous_invite_codes").insert({
      code,
      role: "admin",
      authorised_email: "hello@marvellousjewellers.com",
      created_by: context.userId,
      expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error(error.message);
    return { code };
  });

export const revokeInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("marvellous_invite_codes")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("used_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
