import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/new-job")({
  beforeLoad: () => {
    throw redirect({ to: "/new-repair", replace: true });
  },
});
