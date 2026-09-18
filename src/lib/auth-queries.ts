import { queryOptions } from "@tanstack/react-query";
import { getMyAccess, listInviteCodes, listStaffAccounts } from "./auth.functions";

export const myAccessQuery = queryOptions({
  queryKey: ["my-access"],
  queryFn: () => getMyAccess(),
  staleTime: 60_000,
  retry: false,
});

export const staffAccountsQuery = queryOptions({
  queryKey: ["staff-accounts"],
  queryFn: () => listStaffAccounts(),
  retry: false,
});

export const inviteCodesQuery = queryOptions({
  queryKey: ["invite-codes"],
  queryFn: () => listInviteCodes(),
  retry: false,
});
