import { queryOptions } from "@tanstack/react-query";
import { getClient, getJobByRef, listClients, listJobs, listBespokeProjects, getBespokeProjectByRef } from "./crm.functions";

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

export const bespokeProjectsQuery = queryOptions({
  queryKey: ["bespoke-projects"],
  queryFn: () => listBespokeProjects(),
  staleTime: 10_000,
});

export const bespokeProjectQuery = (ref: string) =>
  queryOptions({
    queryKey: ["bespoke-project", ref.toUpperCase()],
    queryFn: () => getBespokeProjectByRef({ data: { ref } }),
  });
