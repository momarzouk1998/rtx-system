"use client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PrintMovement {
  date: string; // ISO string
  type: string;
  description: string;
  debit: number;
  credit: number;
}

export interface PrintSummaryRow {
  id: string;
  name: string;
  statusLabel: string;
  netBalance: number;
  totalInvoices: number;
  totalPayments: number;
}

export interface StatementPrintData {
  entityName: string;
  typeLabel: string; // "العميل" | "المورد" | "المصنع"
  isAll: boolean;
  dateStr: string;
  totals: { opening: number; debit: number; credit: number; balance: number };
  movements: PrintMovement[];
  summaryRows: PrintSummaryRow[];
}

// ─── Palette (hex only — zero Tailwind, zero external CSS) ───────────────────
const P = {
  blue: "#0284c7",
  blue2: "#0369a1",
  blueFade: "#e0f2fe",
  blue50: "#f0f9ff",
  blueText: "#bae6fd",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate300: "#cbd5e1",
  slate600: "#475569",
  slate700: "#334155",
  slate900: "#0f172a",
  rose50: "#fff1f2",
  rose700: "#be123c",
  rose200: "#fecdd3",
  green50: "#ecfdf5",
  green700: "#047857",
  green200: "#a7f3d0",
  border: "#e2e8f0",
  white: "#ffffff",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const n = (v: number) =>
  Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0 });

// Note: direction: ltr on table container prevents html2canvas from reversing Arabic text.
// Column order in HTML source goes Left → Right. So Cell 1 is Leftmost, Last Cell is Rightmost.
const thRight: React.CSSProperties = {
  padding: "10px 14px",
  color: P.white,
  fontWeight: "700",
  fontSize: "12px",
  textAlign: "right",
  borderRight: "1px solid rgba(255,255,255,0.15)",
  whiteSpace: "nowrap",
  background: "transparent",
};

const thCenter: React.CSSProperties = {
  ...thRight,
  textAlign: "center",
};

const tdRight: React.CSSProperties = {
  padding: "9px 14px",
  borderBottom: `1px solid ${P.border}`,
  fontSize: "12px",
  color: P.slate700,
  textAlign: "right",
};

const tdCenter: React.CSSProperties = {
  ...tdRight,
  textAlign: "center",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({
  label,
  value,
  sub,
  bg,
  bord,
  col,
  labCol,
  subCol,
  glow,
}: {
  label: string;
  value: string;
  sub: string;
  bg: string;
  bord: string;
  col: string;
  labCol: string;
  subCol: string;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: bg,
        border: `1.5px solid ${bord}`,
        borderRadius: "12px",
        padding: "14px 8px",
        textAlign: "center",
        boxShadow: glow
          ? "0 4px 14px rgba(2,132,199,0.30)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          color: labCol,
          fontSize: "11px",
          fontWeight: "700",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ color: col, fontSize: "18px", fontWeight: "900" }}>{value}</div>
      <div style={{ color: subCol, fontSize: "10px", marginTop: "3px" }}>{sub}</div>
    </div>
  );
}

function MovementsTable({
  rows,
  totals,
}: {
  rows: PrintMovement[];
  totals: StatementPrintData["totals"];
}) {
  const bal = totals.balance;
  const balLabel = bal > 0 ? "مدين" : bal < 0 ? "دائن" : "متزن";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left,${P.blue2},${P.blue})` }}>
          {/* Leftmost to Rightmost in LTR table */}
          <th style={{ ...thCenter, borderRight: "none" }}>له (دائن)</th>
          <th style={thCenter}>عليه (مدين)</th>
          <th style={{ ...thRight, width: "36%" }}>البيان والتفاصيل</th>
          <th style={thRight}>نوع الحركة</th>
          <th style={thRight}>التاريخ</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              style={{
                ...tdCenter,
                padding: "28px",
                color: P.slate300,
              }}
            >
              لا توجد حركات مسجلة على هذا الحساب
            </td>
          </tr>
        ) : (
          rows.map((m, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? P.white : P.slate50 }}>
              {/* 1. Credit (Leftmost) */}
              <td
                style={{
                  ...tdCenter,
                  backgroundColor: m.credit > 0 ? P.green50 : "transparent",
                  color: m.credit > 0 ? P.green700 : P.slate300,
                  fontWeight: m.credit > 0 ? "700" : "400",
                }}
              >
                {m.credit > 0 ? n(m.credit) : "—"}
              </td>
              {/* 2. Debit */}
              <td
                style={{
                  ...tdCenter,
                  backgroundColor: m.debit > 0 ? P.rose50 : "transparent",
                  color: m.debit > 0 ? P.rose700 : P.slate300,
                  fontWeight: m.debit > 0 ? "700" : "400",
                }}
              >
                {m.debit > 0 ? n(m.debit) : "—"}
              </td>
              {/* 3. Description */}
              <td style={{ ...tdRight, color: P.slate900 }}>{m.description}</td>
              {/* 4. Type */}
              <td style={tdRight}>
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: P.blue50,
                    border: `1px solid ${P.blueFade}`,
                    color: P.blue,
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.type}
                </span>
              </td>
              {/* 5. Date (Rightmost) */}
              <td style={{ ...tdRight, color: P.slate600, fontWeight: "600", whiteSpace: "nowrap" }}>
                {new Date(m.date).toISOString().split("T")[0]}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left,${P.blue2},${P.blue})` }}>
          <td
            colSpan={2}
            style={{
              padding: "11px 14px",
              color: P.white,
              fontWeight: "900",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            {n(bal)}{" "}
            <span style={{ fontSize: "11px", fontWeight: "600", opacity: 0.85 }}>
              ({balLabel})
            </span>
          </td>
          <td
            colSpan={3}
            style={{
              padding: "11px 14px",
              color: P.white,
              fontWeight: "700",
              fontSize: "12px",
              textAlign: "right",
            }}
          >
            الرصيد المستحق النهائي
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function SummaryTable({
  rows,
  typeLabel,
  totals,
}: {
  rows: PrintSummaryRow[];
  typeLabel: string;
  totals: StatementPrintData["totals"];
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left,${P.blue2},${P.blue})` }}>
          {/* LTR order: Leftmost to Rightmost */}
          <th style={{ ...thCenter, borderRight: "none" }}>صافي الرصيد</th>
          <th style={thCenter}>إجمالي المدفوعات</th>
          <th style={thCenter}>إجمالي الفواتير</th>
          <th style={thCenter}>حالة الحساب</th>
          <th style={thRight}>اسم {typeLabel}</th>
          <th style={{ ...thCenter, width: "36px" }}>#</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const isD = r.netBalance > 0;
          const isC = r.netBalance < 0;
          return (
            <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? P.white : P.slate50 }}>
              {/* 1. Net Balance (Leftmost) */}
              <td
                style={{
                  ...tdCenter,
                  color: isD ? P.rose700 : isC ? P.green700 : P.slate600,
                  fontWeight: "900",
                  fontSize: "13px",
                }}
              >
                {n(r.netBalance)}
              </td>
              {/* 2. Total Payments */}
              <td style={{ ...tdCenter, color: P.green700, fontWeight: "700" }}>
                {n(r.totalPayments)}
              </td>
              {/* 3. Total Invoices */}
              <td style={{ ...tdCenter, color: P.rose700, fontWeight: "700" }}>
                {n(r.totalInvoices)}
              </td>
              {/* 4. Status */}
              <td style={tdCenter}>
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: isD ? P.rose50 : isC ? P.green50 : P.slate100,
                    border: `1px solid ${isD ? P.rose200 : isC ? P.green200 : P.border}`,
                    color: isD ? P.rose700 : isC ? P.green700 : P.slate600,
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.statusLabel}
                </span>
              </td>
              {/* 5. Entity Name */}
              <td style={{ ...tdRight, color: P.slate900, fontWeight: "800", fontSize: "13px" }}>
                {r.name}
              </td>
              {/* 6. Index (Rightmost) */}
              <td style={{ ...tdCenter, color: P.slate600, fontWeight: "600" }}>
                {i + 1}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left,${P.blue2},${P.blue})` }}>
          <td style={{ padding: "11px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "15px" }}>
            {n(totals.balance)}
          </td>
          <td style={{ padding: "11px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.credit)}
          </td>
          <td style={{ padding: "11px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.debit)}
          </td>
          <td colSpan={3} style={{ padding: "11px 14px", color: P.white, fontWeight: "700", fontSize: "12px", textAlign: "right" }}>
            إجمالي كافة الحسابات
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StatementPrintTemplate({ data }: { data: StatementPrintData }) {
  const { entityName, typeLabel, isAll, dateStr, totals, movements, summaryRows } = data;
  const bal = totals.balance;
  const balSub = bal > 0 ? "مدين" : bal < 0 ? "دائن" : "متزن";

  return (
    <div
      id="printable-client-statement"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "794px",
        backgroundColor: P.white,
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
        // Crucial fix: direction ltr prevents html2canvas from reversing Arabic strings!
        direction: "ltr",
        textAlign: "right",
        fontSize: "13px",
        lineHeight: "1.5",
        boxSizing: "border-box",
        color: P.slate900,
      }}
    >
      {/* ═══ HEADER (flex-direction: row-reverse places Right element on Right, Left element on Left) ═══ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${P.blue2} 0%, ${P.blue} 55%, #0ea5e9 100%)`,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Right side: Brand & Logo */}
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: "12px",
              padding: "8px 16px",
              color: P.white,
              fontWeight: "900",
              fontSize: "18px",
            }}
          >
            RTX
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: P.white, fontWeight: "900", fontSize: "17px" }}>
              RTX للتجارة والتصنيع
            </div>
            <div style={{ color: P.blueText, fontSize: "11px", marginTop: "1px" }}>
              نظام إدارة الحسابات والمالية
            </div>
          </div>
        </div>

        {/* Left side: Doc title */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: "10px",
              padding: "7px 18px",
              color: P.white,
              fontWeight: "800",
              fontSize: "13px",
            }}
          >
            {isAll ? `كشف مجمع — ${typeLabel}ين` : `كشف حساب ${typeLabel}`}
          </div>
          <div style={{ color: P.blueText, fontSize: "11px", marginTop: "5px" }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* ═══ ACCENT STRIP ════════════════════════════════════════════════════ */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(to left, ${P.blue2}, ${P.blueText}, ${P.blue2})`,
        }}
      />

      {/* ═══ ENTITY BAR ══════════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: P.blue50,
          borderBottom: `1px solid ${P.border}`,
          padding: "10px 28px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Right side */}
        <div>
          <span style={{ color: P.slate600, fontSize: "12px", fontWeight: "600" }}>
            اسم الحساب:{" "}
          </span>
          <span style={{ color: P.slate900, fontWeight: "900", fontSize: "15px" }}>
            {entityName}
          </span>
        </div>
        {/* Left side */}
        <div
          style={{
            backgroundColor: P.blue,
            color: P.white,
            borderRadius: "20px",
            padding: "3px 14px",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* ═══ SUMMARY CARDS (row-reverse places Card 1 on Right, Card 4 on Left) ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          gap: "12px",
          padding: "16px 28px",
          backgroundColor: P.slate50,
          borderBottom: `1px solid ${P.border}`,
        }}
      >
        {/* Rightmost: Opening Balance */}
        <Card
          label="رصيد افتتاحي"
          value={n(totals.opening)}
          sub="جنيه"
          bg={P.white}
          bord={P.border}
          col={P.slate900}
          labCol={P.slate600}
          subCol={P.slate300}
        />
        {/* Middle Right: Total Invoices / Debit */}
        <Card
          label={isAll ? "إجمالي الفواتير" : "المدين"}
          value={n(totals.debit)}
          sub="جنيه"
          bg={P.rose50}
          bord={P.rose200}
          col={P.rose700}
          labCol={P.rose700}
          subCol="#fca5a5"
        />
        {/* Middle Left: Total Payments / Credit */}
        <Card
          label={isAll ? "إجمالي المدفوعات" : "الدائن"}
          value={n(totals.credit)}
          sub="جنيه"
          bg={P.green50}
          bord={P.green200}
          col={P.green700}
          labCol={P.green700}
          subCol="#6ee7b7"
        />
        {/* Leftmost: Final Balance */}
        <Card
          label="الرصيد النهائي"
          value={n(bal)}
          sub={balSub}
          bg={P.blue}
          bord={P.blue2}
          col={P.white}
          labCol={P.blueText}
          subCol={P.blueText}
          glow
        />
      </div>

      {/* ═══ TABLE ════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 28px" }}>
        {isAll ? (
          <SummaryTable rows={summaryRows} typeLabel={typeLabel} totals={totals} />
        ) : (
          <MovementsTable rows={movements} totals={totals} />
        )}
      </div>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: `2px solid ${P.border}`,
          padding: "10px 28px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: P.slate50,
        }}
      >
        <div style={{ color: P.slate600, fontSize: "10px" }}>
          هذه الوثيقة صادرة إلكترونياً من نظام RTX — جميع الحقوق محفوظة
        </div>
        <div style={{ color: P.blue, fontSize: "10px", fontWeight: "700" }}>
          RTX System · {dateStr}
        </div>
      </div>
    </div>
  );
}
