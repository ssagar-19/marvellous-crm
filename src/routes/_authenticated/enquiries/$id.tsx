import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Image,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  User,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { outlook } from "@/lib/crm-data";

export const Route = createFileRoute("/_authenticated/enquiries/$id")({
  component: EnquiryDetail,
});

function EnquiryDetail() {

      const { id } = Route.useParams();

  const enquiry = outlook.find((item) => item.title === id);

  const customerName = enquiry?.who ?? "Unknown Customer";
  const subject = enquiry?.title ?? "Enquiry";
  const message = enquiry?.body ?? "No enquiry message available.";

  return (
    <div className="px-10 py-8 text-white">
      <Link
        to="/enquiries"
        className="mb-5 inline-flex items-center gap-2 text-base font-medium text-white/80 hover:text-[#a67c32]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Enquiries
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-4xl text-white">
              {customerName}
            </h1>

            <span className="rounded-full border border-[#b7d0e5] bg-[#e6f0f8] px-4 py-1.5 text-sm font-semibold text-[#315a7a]">
              New Enquiry
            </span>
          </div>

          <h2 className="mt-2 text-lg text-white/80">
            {subject}
          </h2>

          <div className="mt-4 flex items-center gap-7 text-base text-white/60">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              16 Sep 2025, 14:32
            </span>

            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              sarah.williams@email.com
            </span>

            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +44 7700 900123
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ddd4c3] bg-[#0d2737]/80">
            <MoreHorizontal className="h-5 w-5" />
          </button>

          <button className="rounded-xl border border-[#b38a3d] bg-[#0d2737]/80 px-6 py-3 text-base font-semibold">
            Mark as Closed
          </button>

          <button className="flex items-center gap-3 rounded-xl bg-[#172d3d] px-6 py-3 text-base font-semibold text-white">
            Convert to Job
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-5">
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <h3 className="font-serif text-xl">Customer Details</h3>
              </div>

              <button className="rounded-xl border border-[#ddd4c3] px-4 py-2 text-base font-medium">
                Edit
              </button>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d2737]/60 p-4 text-base">
              <InfoRow label="Name" value="Sarah Williams" />
              <InfoRow label="Phone" value="+44 7700 900123" />
              <InfoRow label="Email" value="sarah.williams@email.com" />
              <InfoRow label="Preferred Contact" value="Email" />
              <InfoRow label="Postcode" value="SW3 4AB" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-serif text-xl">Enquiry Details</h3>
              </div>

              <button className="rounded-xl border border-[#ddd4c3] px-4 py-2 text-base font-medium">
                Edit
              </button>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-[#0d2737]/60 p-4 text-base">
              <InfoRow
                label="Enquiry Type"
                value={
                  <span className="rounded-full bg-[#f3e5c5] px-4 py-1 font-medium text-[#72531f]">
                    Repair
                  </span>
                }
              />

              <InfoRow label="Item Type" value="Ring" />
              <InfoRow label="Subject" value="New repair booking" />

              <div className="grid grid-cols-[125px_1fr] gap-4">
                <span className="text-[#74797c]">Message</span>

                <p className="leading-6 text-white/80">
                  {message}
                </p>
              </div>

              <InfoRow label="Date Received" value="16 Sep 2025, 14:32" />
              <InfoRow label="Source" value="Website Enquiry Form" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <h3 className="font-serif text-xl">Internal Notes</h3>
              </div>

              <button className="flex items-center gap-2 rounded-xl border border-[#ddd4c3] px-4 py-2 text-base font-medium">
                <Plus className="h-4 w-4" />
                Add Note
              </button>
            </div>

            <div className="rounded-xl border border-[#e1dbcf] bg-[#0d2737]/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#172d3d] text-[10px] font-semibold text-white">
                    SP
                  </div>

                  <span className="text-base font-semibold">Sagar</span>
                </div>

                <span className="text-sm text-[#858585]">Just now</span>
              </div>

              <p className="ml-11 text-base leading-6 text-white/80">
                Customer looking to resize inherited ring. Awaiting photos for
                assessment.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5" />
                <h3 className="font-serif text-xl">Item Photos</h3>
              </div>

              <button className="rounded-xl border border-[#ddd4c3] px-4 py-2 text-base font-medium">
                Add Photos
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3].map((photo) => (
                <div
                  key={photo}
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#ded8cc] bg-gradient-to-br from-[#e8dfd0] via-[#f5efe4] to-[#c8bda9]"
                >
                  <span className="font-serif text-4xl text-[#a67c32]/60">
                    ◇
                  </span>
                </div>
              ))}

              <button className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-[#c9c2b5] bg-[#0d2737]/80 text-base text-[#667078]">
                <Plus className="mb-2 h-6 w-6" />
                Add Photos
                <span className="mt-1 text-sm">or drag and drop</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-6 flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <h3 className="font-serif text-xl">Status</h3>
            </div>

            <div className="relative px-3">
              <div className="absolute left-6 right-6 top-3 h-[3px] bg-[#d9d7d1]" />
              <div className="absolute left-6 top-3 h-[3px] w-[13%] bg-[#315a7a]" />

              <div className="relative flex justify-between">
                {[
                  "New Enquiry",
                  "In Discussion",
                  "Converted to Job",
                  "Closed",
                ].map((status, index) => (
                  <div
                    key={status}
                    className="flex w-[25%] flex-col items-center text-center"
                  >
                    <div
                      className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        index === 0
                          ? "border-[#b38a3d] bg-[#172d3d]"
                          : "border-[#d2d0ca] bg-[#e7e5df]"
                      }`}
                    >
                      {index === 0 && (
                        <span className="h-2 w-2 rounded-full bg-[#d7b66c]" />
                      )}
                    </div>

                    <span
                      className={`mt-3 text-sm
                         ${
                        index === 0
                          ? "font-semibold text-white"
                          : "text-[#6e7376]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-xl text-[#a67c32]">◇</span>
              <h3 className="font-serif text-xl">Conversion Options</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ConversionCard
                icon={<Wrench className="h-5 w-5" />}
                title="Create Repair Job"
                description="Convert this enquiry into a repair job and add it to the workshop queue."
                button="Create Repair Job"
                dark
              />

              <ConversionCard
                icon={<span className="text-xl">◇</span>}
                title="Create Bespoke Commission"
                description="Convert this enquiry into a bespoke commission project."
                button="Create Bespoke Job"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0d3145]/70 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="mb-5 flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <h3 className="font-serif text-xl">Enquiry History</h3>
            </div>

            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0d3145]/70">
              <HistoryRow
                icon={<Mail className="h-4 w-4" />}
                title="Enquiry received via website"
                description="New repair booking"
                date="16 Sep 2025, 14:32"
              />

              <HistoryRow
                icon={<FileText className="h-4 w-4" />}
                title="Enquiry created in CRM"
                description="Automatically logged"
                date="16 Sep 2025, 14:32"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[125px_1fr] items-start gap-4">
      <span className="text-[#74797c]">{label}</span>
      <span className="font-medium text-white/80">{value}</span>
    </div>
  );
}

function ConversionCard({
  icon,
  title,
  description,
  button,
  dark = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  button: string;
  dark?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e1dbcf] bg-[#0d2737]/80 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e6cd] text-[#6f5424]">
          {icon}
        </div>

        <h4 className="font-serif text-base text-white">{title}</h4>
      </div>

      <p className="mb-5 min-h-[48px] text-base leading-5 text-white/60">
        {description}
      </p>

      <button
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-semibold ${
          dark
            ? "border-[#172d3d] bg-[#172d3d] text-white"
            : "border-[#b38a3d] bg-[#0d2737]/80 text-white"
        }`}
      >
        {button}
        <span>→</span>
      </button>
    </div>
  );
}

function HistoryRow({
  icon,
  title,
  description,
  date,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e7d3] text-[#8d6b2e]">
        {icon}
      </div>

      <div className="flex-1">
        <div className="text-base font-semibold text-white/80">{title}</div>
        <div className="mt-1 text-sm text-white/60">{description}</div>
      </div>

      <span className="text-sm text-white/60">{date}</span>
    </div>
  );
}