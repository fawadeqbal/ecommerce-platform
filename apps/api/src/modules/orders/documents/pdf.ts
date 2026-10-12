import PDFDocument from 'pdfkit';

/** Plain data for one invoice page (one seller's sub-order). Amounts are already formatted. */
export interface InvoiceData {
  number: string;
  issuedAt: Date;
  orderNumber: string;
  placedAt: Date;
  store: { name: string; address: string | null; email: string | null; phone: string | null };
  seller: { name: string; email: string; phone: string | null };
  billTo: string[];
  payment: string;
  lines: {
    name: string;
    sku: string;
    qty: number;
    unit: string;
    total: string;
    tax: string | null;
  }[];
  totals: { label: string; value: string; strong?: boolean }[];
  notes: string[];
}

export interface PackingSlipData {
  orderNumber: string;
  placedAt: Date;
  seller: string;
  shipTo: string[];
  shippingMethod: string | null;
  lines: { name: string; sku: string; qty: number }[];
  customerNote: string | null;
}

const date = (d: Date) => d.toISOString().slice(0, 10);
const GREY = '#6b7280';

function toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function header(doc: PDFKit.PDFDocument, title: string, right: string[]) {
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#111827').text(title, 50, 50);
  doc.font('Helvetica').fontSize(9).fillColor(GREY);
  right.forEach((line, i) => doc.text(line, 300, 52 + i * 12, { width: 245, align: 'right' }));
  doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e5e7eb').stroke();
}

function block(doc: PDFKit.PDFDocument, x: number, y: number, label: string, lines: string[]) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GREY).text(label.toUpperCase(), x, y);
  doc.font('Helvetica').fontSize(10).fillColor('#111827');
  lines.filter(Boolean).forEach((l, i) => doc.text(l, x, y + 14 + i * 13, { width: 230 }));
}

/** One page per invoice (each seller's sub-order of the order). */
export function renderInvoices(
  invoices: InvoiceData[],
  opts: { compress?: boolean } = {},
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    compress: opts.compress ?? true,
    autoFirstPage: false,
  });
  for (const inv of invoices) {
    doc.addPage();
    header(doc, 'Invoice', [
      `Invoice ${inv.number}`,
      `Issued ${date(inv.issuedAt)}`,
      `Order ${inv.orderNumber} · placed ${date(inv.placedAt)}`,
      inv.payment,
    ]);
    block(doc, 50, 125, 'Sold by', [
      inv.seller.name,
      inv.seller.email,
      inv.seller.phone ?? '',
      `via ${inv.store.name}`,
    ]);
    block(doc, 315, 125, 'Bill / ship to', inv.billTo);

    let y = 215;
    const cols = { name: 50, qty: 310, unit: 350, tax: 420, total: 480 };
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GREY);
    doc.text('ITEM', cols.name, y).text('QTY', cols.qty, y, { width: 35, align: 'right' });
    doc
      .text('PRICE', cols.unit, y, { width: 65, align: 'right' })
      .text('TAX', cols.tax, y, { width: 55, align: 'right' });
    doc.text('TOTAL', cols.total, y, { width: 65, align: 'right' });
    y += 16;
    doc.font('Helvetica').fontSize(10).fillColor('#111827');
    for (const l of inv.lines) {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      doc.text(l.name, cols.name, y, { width: 250 });
      const h = Math.max(doc.heightOfString(l.name, { width: 250 }), 12);
      doc
        .fontSize(8)
        .fillColor(GREY)
        .text(l.sku, cols.name, y + h, { width: 250 });
      doc.fontSize(10).fillColor('#111827');
      doc.text(String(l.qty), cols.qty, y, { width: 35, align: 'right' });
      doc.text(l.unit, cols.unit, y, { width: 65, align: 'right' });
      doc.text(l.tax ?? '—', cols.tax, y, { width: 55, align: 'right' });
      doc.text(l.total, cols.total, y, { width: 65, align: 'right' });
      y += h + 18;
    }
    doc.moveTo(300, y).lineTo(545, y).strokeColor('#e5e7eb').stroke();
    y += 8;
    for (const t of inv.totals) {
      doc.font(t.strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(t.strong ? 11 : 10);
      doc
        .text(t.label, 300, y, { width: 160 })
        .text(t.value, 460, y, { width: 85, align: 'right' });
      y += 16;
    }
    doc.font('Helvetica').fontSize(8).fillColor(GREY);
    const foot = [
      ...inv.notes,
      [inv.store.name, inv.store.address, inv.store.email, inv.store.phone]
        .filter(Boolean)
        .join(' · '),
    ];
    doc.text(foot.join('\n'), 50, 760, { width: 495, align: 'center' });
  }
  if (invoices.length === 0) doc.addPage().text('No invoice available.');
  return toBuffer(doc);
}

/** One page per seller parcel: what to pack, no prices. */
export function renderPackingSlips(
  slips: PackingSlipData[],
  opts: { compress?: boolean } = {},
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    compress: opts.compress ?? true,
    autoFirstPage: false,
  });
  for (const s of slips) {
    doc.addPage();
    header(doc, 'Packing slip', [
      `Order ${s.orderNumber}`,
      `Placed ${date(s.placedAt)}`,
      s.seller,
      s.shippingMethod ?? '',
    ]);
    block(doc, 50, 125, 'Ship to', s.shipTo);
    let y = 225;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GREY);
    doc.text('ITEM', 75, y).text('SKU', 360, y).text('QTY', 480, y, { width: 65, align: 'right' });
    y += 16;
    doc.font('Helvetica').fontSize(11).fillColor('#111827');
    for (const l of s.lines) {
      if (y > 740) {
        doc.addPage();
        y = 50;
      }
      doc.rect(50, y, 10, 10).strokeColor('#9ca3af').stroke();
      doc.text(l.name, 75, y, { width: 275 });
      doc.fontSize(9).text(l.sku, 360, y, { width: 115 }).fontSize(11);
      doc
        .font('Helvetica-Bold')
        .text(String(l.qty), 480, y, { width: 65, align: 'right' })
        .font('Helvetica');
      y += Math.max(doc.heightOfString(l.name, { width: 275 }), 12) + 12;
    }
    if (s.customerNote) {
      y += 10;
      block(doc, 50, y, 'Customer note', [s.customerNote]);
    }
  }
  if (slips.length === 0) doc.addPage().text('Nothing to pack.');
  return toBuffer(doc);
}
