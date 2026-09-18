import { queryOptions } from "@tanstack/react-query";
import { getClient, getJobByRef, listClients, listJobs } from "./crm.functions";

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: () => listJobs(),
  staleTime: 10_000,
});

export const clientsQuery = queryOptions({
  queryKey: ["clients"],
  queryFn: () => listClients(),
  staleTime: 10_000,
});

export const jobQuery = (ref: string) =>
  queryOptions({
    queryKey: ["job", ref.toUpperCase()],
    queryFn: () => getJobByRef({ data: { ref } }),
  });

export const clientQuery = (id: string) =>
  queryOptions({
    queryKey: ["client", id],
    queryFn: () => getClient({ data: { id } }),
  });
