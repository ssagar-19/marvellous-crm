import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  buildInvoicePdf,
  invoicePdfFileName,
} from "@/lib/invoice-pdf";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { jobQuery } from "@/lib/crm-queries";

export const Route = createFileRoute("/_authenticated/invoices/$id")({
  component: InvoicePage,
});

type LineItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

function InvoicePage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(jobQuery(id));

  const job = data!.job;

  const [invoiceNumber] = useState(
    `INV-${job.reference.replace(/\D/g, "") || "NEW"}`,
  );

  const [invoiceDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );

  const [dueDate, setDueDate] = useState("");

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 1,
      description: job.service || "Jewellery repair",
      quantity: 1,
      unitPrice: job.quotedPrice ?? 0,
    },
  ]);

  const [vatRate, setVatRate] = useState(20);
  const [vatOpen, setVatOpen] = useState(false);

  const [depositPaid, setDepositPaid] = useState<number | "">(
    job.depositAmount ?? 0,
  );

  const [notes, setNotes] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      ),
    [lineItems],
  );

  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;
  const amountDue = Math.max(total - (depositPaid === "" ? 0 : depositPaid), 0);

  const updateLineItem = (
    id: number,
    field: keyof LineItem,
    value: string,
  ) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        if (field === "description") {
          return {
            ...item,
            description: value,
          };
        }

        const numericValue = Number(value);

        return {
          ...item,
          [field]: Number.isFinite(numericValue) ? numericValue : 0,
        };
      }),
    );
  };

  const addLineItem = () => {
    setLineItems((items) => [
      ...items,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (id: number) => {
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const money = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);

  const formatDate = (value: string) => {
    if (!value) return "Not set";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-none px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            to="/jobs/$ref"
            params={{ ref: job.reference }}
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Job
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl glass-inset">
              <FileText className="size-5 text-gold" />
            </div>

            <div>
              <h1 className="font-display text-3xl">
                Create Invoice
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the details and charges before generating the invoice.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
       <button
  type="button"
  onClick={() => {
    const pdf = buildInvoicePdf({
      invoiceNumber,
      invoiceDate,
      dueDate: dueDate || null,

      company: {
        name: "Marvellous Jewellers",
        address: null,
        phone: null,
        email: null,
        website: null,
        vatNumber: null,
      },

      customer: {
        name: job.clientName,
        email: job.clientEmail,
        phone: job.clientPhone,
        address: null,
        postcode: job.clientPostcode,
      },

      job: {
        reference: job.reference,
        item: job.itemType,
        service: job.service,
        description: job.itemDescription || "",
      },

      items: lineItems,

      vatRate,
      depositPaid: Number(depositPaid) || 0,
      notes: notes || null,
    });

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return url;
    });
  }}
  className="glass flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
>
  <Eye className="size-4 text-gold" />
  Preview
</button>

          <button
  type="button"
  onClick={() => {
    const pdf = buildInvoicePdf({
      invoiceNumber,
      invoiceDate,
      dueDate: dueDate || null,

      company: {
        name: "Marvellous Jewellers",
        address: null,
        phone: null,
        email: null,
        website: null,
        vatNumber: null,
      },

      customer: {
        name: job.clientName,
        email: job.clientEmail,
        phone: job.clientPhone,
        address: null,
        postcode: job.clientPostcode,
      },

      job: {
        reference: job.reference,
        item: job.itemType,
        service: job.service,
        description: job.itemDescription || "",
      },

      items: lineItems,

      vatRate,
      depositPaid: Number(depositPaid) || 0,
      notes: notes || null,
    });

    pdf.save(invoicePdfFileName(invoiceNumber));
  }}
  className="glass flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
>
  <Download className="size-4 text-gold" />
  Generate PDF
</button>
        </div>
      </div>

{previewUrl && (
  <div className="glass mb-6 rounded-2xl p-4">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          PDF Preview
        </p>
        <p className="mt-1 text-sm">
          Review the invoice before downloading it.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(null);
        }}
        className="glass rounded-lg px-3 py-2 text-sm"
      >
        Close Preview
      </button>
    </div>

    <iframe
      src={previewUrl}
      title="Invoice PDF Preview"
      className="h-[800px] w-full rounded-xl border border-white/10 bg-white"
    />
  </div>
)}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main workspace */}
        <div className="space-y-6">
          {/* Invoice details */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Invoice Details
                </p>
                <h2 className="mt-1 font-display text-xl">
                  Invoice information
                </h2>
              </div>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
                Draft
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Invoice Number
                </label>
                <div className="mt-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2.5 text-sm">
                  {invoiceNumber}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Invoice Date
                </label>
                <div className="mt-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2.5 text-sm">
                  {formatDate(invoiceDate)}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/10 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </div>
            </div>
          </section>

          {/* Customer */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Bill To
              </p>
              <h2 className="mt-1 font-display text-xl">
                Customer details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Name
                </p>
                <p className="mt-2 text-base">
                  {job.clientName}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-2 text-base">
                  {job.clientPhone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 text-base">
                  {job.clientEmail || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Postcode
                </p>
                <p className="mt-2 text-base">
                  {job.clientPostcode || "Not provided"}
                </p>
              </div>
            </div>
          </section>

          {/* Job */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Job
              </p>
              <h2 className="mt-1 font-display text-xl">
                Work details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Reference
                </p>
                <p className="mt-2">{job.reference}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Item
                </p>
                <p className="mt-2">{job.itemType}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Service
                </p>
                <p className="mt-2">{job.service}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Description
              </p>
              <p className="mt-2 text-sm leading-6">
                {job.itemDescription || "No description provided."}
              </p>
            </div>
          </section>

          {/* Charges */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Charges
                </p>
                <h2 className="mt-1 font-display text-xl">
                  Invoice items
                </h2>
              </div>

              <button
                type="button"
                onClick={addLineItem}
                className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <Plus className="size-4 text-gold" />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              <div className="hidden grid-cols-[1fr_90px_130px_110px_40px] gap-3 px-3 text-xs uppercase tracking-[0.12em] text-muted-foreground md:grid">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
                <span />
              </div>

              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-xl border border-white/10 bg-black/10 p-3 md:grid-cols-[1fr_90px_130px_110px_40px] md:items-center"
                >
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Description"
                    className="rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                  />

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "quantity",
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "unitPrice",
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                  />

                  <div className="px-1 text-sm font-medium">
                    {money(item.quantity * item.unitPrice)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove invoice item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="glass rounded-2xl p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Notes
              </p>
              <h2 className="mt-1 font-display text-xl">
                Customer-facing notes
              </h2>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes that should appear on the invoice..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm outline-none focus:border-gold/50"
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-6 xl:sticky xl:top-6">
          <section className="glass rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Summary
              </p>
              <h2 className="mt-1 font-display text-xl">
                Invoice total
              </h2>
            </div>

            <div className="space-y-4 text-base">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-base">{money(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  VAT
                </span>

                <div className="relative w-28">
                  <button
                    type="button"
                    onClick={() => setVatOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-xl border border-gold/50 bg-black/10 px-4 py-3 text-base outline-none transition-colors hover:border-gold focus:border-gold"
                  >
                    <span>{vatRate}%</span>
                    <span
                      className={
                        "text-gold transition-transform duration-200 " +
                        (vatOpen ? "rotate-180" : "")
                      }
                    >
                      ▾
                    </span>
                  </button>

                  {vatOpen ? (
                    <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gold/40 bg-[var(--sidebar)] p-1 shadow-xl backdrop-blur-xl">
                      {[20, 0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => {
                            setVatRate(rate);
                            setVatOpen(false);
                          }}
                          className={
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors " +
                            (vatRate === rate
                              ? "bg-gold/15 text-gold"
                              : "text-foreground hover:bg-white/5")
                          }
                        >
                          <span>{rate}%</span>
                          {vatRate === rate ? (
                            <span className="text-gold">✓</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  VAT amount
                </span>
                <span className="text-base">{money(vatAmount)}</span>
              </div>

              <div className="my-4 border-t border-white/10" />

              <div className="flex justify-between gap-4 text-lg">
                <span>Total</span>
                <span className="text-lg font-medium">
                  {money(total)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Deposit paid
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositPaid}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDepositPaid(value === "" ? "" : Number(value));
                  }}
                  className="w-28 appearance-none rounded-xl border border-gold/50 bg-transparent px-3 py-3 text-right text-base outline-none transition-colors focus:border-gold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div className="my-4 border-t border-gold/20" />

              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Amount Due
                  </span>
                  <span className="font-display text-2xl text-gold">
                    {money(amountDue)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Invoice Status
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="size-2 rounded-full bg-gold" />
              <span className="text-sm">
                Draft invoice
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              The invoice will not affect the job until it is saved as a
              final invoice.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}