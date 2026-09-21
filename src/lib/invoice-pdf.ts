import { jsPDF } from "jspdf";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;

  company: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    vatNumber: string | null;
  };

  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    postcode: string | null;
  };

  job: {
    reference: string;
    item: string;
    service: string;
    description: string;
  };

  items: InvoiceLineItem[];

  vatRate: number;
  depositPaid: number;
  notes: string | null;
};

const NAVY: [number, number, number] = [13, 39, 55];
const GOLD: [number, number, number] = [184, 145, 68];
const IVORY: [number, number, number] = [248, 246, 240];
const CHARCOAL: [number, number, number] = [40, 42, 46];
const GREY: [number, number, number] = [110, 116, 128];
const LINE: [number, number, number] = [224, 226, 230];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;

function money(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function text(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  options: {
    size?: number;
    bold?: boolean;
    color?: [number, number, number];
    align?: "left" | "right";
  } = {},
) {
  doc.setFont("helvetica", options.bold ? "bold" : "normal");
  doc.setFontSize(options.size ?? 10);
  doc.setTextColor(...(options.color ?? CHARCOAL));

  doc.text(
    value,
    x,
    y,
    options.align === "right" ? { align: "right" } : undefined,
  );
}

function wrapped(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
  width: number,
  size = 10,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...CHARCOAL);

  const lines = doc.splitTextToSize(value, width) as string[];

  doc.text(lines, x, y);

  return y + lines.length * (size * 0.45 + 1.2);
}

export function buildInvoicePdf(
  invoice: InvoicePdfData,
  logoDataUrl?: string | null,
): jsPDF {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const contentW = PAGE_W - MARGIN * 2;

  let y = MARGIN;

  // ---------------------------------------------------------
  // Header
  // ---------------------------------------------------------

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 42, "F");

  let companyX = MARGIN;

  if (logoDataUrl) {
    try {
      doc.setFillColor(...IVORY);
      doc.roundedRect(MARGIN, 7, 24, 24, 2, 2, "F");

      const format = logoDataUrl.includes("image/png") ? "PNG" : "JPEG";

      doc.addImage(
        logoDataUrl,
        format,
        MARGIN + 2,
        9,
        20,
        20,
      );

      companyX = MARGIN + 30;
    } catch {
      // Logo failure must never prevent invoice generation.
    }
  }

  text(doc, invoice.company.name, companyX, 16, {
    size: 16,
    bold: true,
    color: [255, 255, 255],
  });

  const companyDetails = [
    invoice.company.address,
    [invoice.company.phone, invoice.company.email]
      .filter(Boolean)
      .join("  ·  "),
    invoice.company.website,
  ].filter(Boolean) as string[];

  companyDetails.forEach((line, index) => {
    text(doc, line, companyX, 23 + index * 4.5, {
      size: 8,
      color: [220, 218, 208],
    });
  });

  text(doc, "INVOICE", PAGE_W - MARGIN, 16, {
    size: 17,
    bold: true,
    color: [255, 255, 255],
    align: "right",
  });

  text(doc, invoice.invoiceNumber, PAGE_W - MARGIN, 23, {
    size: 9,
    color: [220, 218, 208],
    align: "right",
  });

  if (invoice.company.vatNumber) {
    text(
      doc,
      `VAT No. ${invoice.company.vatNumber}`,
      PAGE_W - MARGIN,
      29,
      {
        size: 8,
        color: [220, 218, 208],
        align: "right",
      },
    );
  }

  y = 53;

  // ---------------------------------------------------------
  // Customer / Invoice details
  // ---------------------------------------------------------

  doc.setFillColor(...IVORY);
  doc.roundedRect(MARGIN, y, contentW, 42, 3, 3, "F");

  text(doc, "BILL TO", MARGIN + 6, y + 8, {
    size: 8,
    bold: true,
    color: GOLD,
  });

  text(doc, invoice.customer.name || "—", MARGIN + 6, y + 15, {
    size: 11,
    bold: true,
  });

  const customerAddress = [
    invoice.customer.address,
    invoice.customer.postcode,
    invoice.customer.email,
    invoice.customer.phone,
  ].filter(Boolean) as string[];

  customerAddress.forEach((line, index) => {
    text(doc, line, MARGIN + 6, y + 21 + index * 4.2, {
      size: 8.5,
      color: GREY,
    });
  });

  const detailX = MARGIN + contentW / 2 + 10;

  text(doc, "INVOICE DETAILS", detailX, y + 8, {
    size: 8,
    bold: true,
    color: GOLD,
  });

  text(doc, "Invoice number:", detailX, y + 16, {
    size: 8,
    color: GREY,
  });

  text(doc, invoice.invoiceNumber, detailX + 32, y + 16, {
    size: 8.5,
    bold: true,
  });

  text(doc, "Invoice date:", detailX, y + 22, {
    size: 8,
    color: GREY,
  });

  text(doc, formatDate(invoice.invoiceDate), detailX + 32, y + 22, {
    size: 8.5,
    bold: true,
  });

  if (invoice.dueDate) {
    text(doc, "Due date:", detailX, y + 28, {
      size: 8,
      color: GREY,
    });

    text(doc, formatDate(invoice.dueDate), detailX + 32, y + 28, {
      size: 8.5,
      bold: true,
    });
  }

  text(doc, "Job reference:", detailX, y + 34, {
    size: 8,
    color: GREY,
  });

  text(doc, invoice.job.reference, detailX + 32, y + 34, {
    size: 8.5,
    bold: true,
  });

  y += 52;

  // ---------------------------------------------------------
  // Job summary
  // ---------------------------------------------------------

  text(doc, "JOB SUMMARY", MARGIN, y, {
    size: 11,
    bold: true,
  });

  y += 3;

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, y, MARGIN + 16, y);
  doc.setLineWidth(0.2);

  y += 8;

  text(doc, "Item", MARGIN, y, {
    size: 8,
    color: GREY,
  });

  text(doc, invoice.job.item || "—", MARGIN + 30, y, {
    size: 9,
    bold: true,
  });

  text(doc, "Service", MARGIN + 85, y, {
    size: 8,
    color: GREY,
  });

  text(doc, invoice.job.service || "—", MARGIN + 115, y, {
    size: 9,
    bold: true,
  });

  y += 7;

  text(doc, "Description", MARGIN, y, {
    size: 8,
    color: GREY,
  });

  y = wrapped(
    doc,
    invoice.job.description || "—",
    MARGIN + 30,
    y,
    contentW - 30,
    9,
  );

  y += 8;

  // ---------------------------------------------------------
  // Charges
  // ---------------------------------------------------------

  text(doc, "CHARGES", MARGIN, y, {
    size: 11,
    bold: true,
  });

  y += 4;

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, contentW, 9, 2, 2, "F");

  text(doc, "Description", MARGIN + 5, y + 6, {
    size: 8,
    bold: true,
    color: [255, 255, 255],
  });

  text(doc, "Qty", PAGE_W - MARGIN - 52, y + 6, {
    size: 8,
    bold: true,
    color: [255, 255, 255],
    align: "right",
  });

  text(doc, "Amount", PAGE_W - MARGIN - 5, y + 6, {
    size: 8,
    bold: true,
    color: [255, 255, 255],
    align: "right",
  });

  y += 15;

  let subtotal = 0;

  invoice.items.forEach((item) => {
    const lineTotal = item.quantity * item.unitPrice;

    subtotal += lineTotal;

    text(doc, item.description || "Item", MARGIN + 5, y, {
      size: 9,
    });

    text(
      doc,
      String(item.quantity),
      PAGE_W - MARGIN - 52,
      y,
      {
        size: 9,
        align: "right",
      },
    );

    text(
      doc,
      money(lineTotal),
      PAGE_W - MARGIN - 5,
      y,
      {
        size: 9,
        align: "right",
      },
    );

    y += 7;

    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  });

  y += 4;

  const vat = Math.round(subtotal * invoice.vatRate * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  const amountDue = Math.max(0, total - invoice.depositPaid);

  const totalsX = PAGE_W - MARGIN - 5;

  text(doc, "Subtotal", PAGE_W - 70, y, {
    size: 9,
    color: GREY,
  });

  text(doc, money(subtotal), totalsX, y, {
    size: 9,
    align: "right",
  });

  y += 6;

  text(doc, `VAT (${Math.round(invoice.vatRate * 100)}%)`, PAGE_W - 70, y, {
    size: 9,
    color: GREY,
  });

  text(doc, money(vat), totalsX, y, {
    size: 9,
    align: "right",
  });

  y += 7;

  doc.setFillColor(...NAVY);
  doc.roundedRect(PAGE_W - 82, y - 4.5, 64, 10, 2, 2, "F");

  text(doc, "TOTAL", PAGE_W - 77, y + 2, {
    size: 9,
    bold: true,
    color: [255, 255, 255],
  });

  text(doc, money(total), totalsX, y + 2, {
    size: 10,
    bold: true,
    color: [255, 255, 255],
    align: "right",
  });

  y += 14;

  if (invoice.depositPaid > 0) {
    text(doc, "Deposit paid", PAGE_W - 70, y, {
      size: 9,
      color: GREY,
    });

    text(doc, `-${money(invoice.depositPaid)}`, totalsX, y, {
      size: 9,
      align: "right",
    });

    y += 8;

    doc.setFillColor(...GOLD);
    doc.roundedRect(PAGE_W - 82, y - 4.5, 64, 10, 2, 2, "F");

    text(doc, "AMOUNT DUE", PAGE_W - 77, y + 2, {
      size: 8,
      bold: true,
      color: [255, 255, 255],
    });

    text(doc, money(amountDue), totalsX, y + 2, {
      size: 10,
      bold: true,
      color: [255, 255, 255],
      align: "right",
    });

    y += 14;
  }

  // ---------------------------------------------------------
  // Notes
  // ---------------------------------------------------------

  if (invoice.notes?.trim()) {
    y += 4;

    text(doc, "NOTES", MARGIN, y, {
      size: 10,
      bold: true,
    });

    y += 7;

    y = wrapped(
      doc,
      invoice.notes.trim(),
      MARGIN,
      y,
      contentW,
      9,
    );
  }

  // ---------------------------------------------------------
  // Footer
  // ---------------------------------------------------------

  doc.setDrawColor(...LINE);
  doc.line(MARGIN, PAGE_H - 17, PAGE_W - MARGIN, PAGE_H - 17);

  text(doc, invoice.company.name, MARGIN, PAGE_H - 10, {
    size: 8,
    color: GREY,
  });

  text(doc, "Thank you for your business.", PAGE_W / 2, PAGE_H - 10, {
    size: 8,
    color: GREY,
    align: "right",
  });

  return doc;
}

export function invoicePdfFileName(invoiceNumber: string): string {
  const safeNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]+/g, "-");

  return `Marvellous-Invoice-${safeNumber}.pdf`;
}