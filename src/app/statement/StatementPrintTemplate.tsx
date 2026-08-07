"use client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PrintMovement {
  date: string;
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

// ─── Palette (hex only) ───────────────────────────────────────────────────────
const P = {
  blue: "#0284c7",
  blueDark: "#0369a1",
  blueFade: "#e0f2fe",
  blueLight: "#f0f9ff",
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

const thRight: React.CSSProperties = {
  padding: "12px 14px",
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
  padding: "11px 14px",
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
        backgroundColor: bg,
        border: `1.5px solid ${bord}`,
        borderRadius: "14px",
        padding: "16px 12px",
        textAlign: "center",
        boxShadow: glow
          ? "0 4px 14px rgba(2,132,199,0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          color: labCol,
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "8px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div style={{ color: col, fontSize: "20px", fontWeight: "900", lineHeight: "1.2" }}>
        {value}
      </div>
      <div style={{ color: subCol, fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
        {sub}
      </div>
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
  const balLabel = bal > 0 ? "عليه\u00A0ديون" : bal < 0 ? "له\u00A0مستحقات" : "خالص";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <th style={{ ...thCenter, width: "18%", borderRight: "none" }}>له\u00A0مستحقات</th>
          <th style={{ ...thCenter, width: "18%" }}>عليه\u00A0ديون</th>
          <th style={{ ...thRight, width: "36%" }}>البيان\u00A0والتفاصيل</th>
          <th style={{ ...thRight, width: "14%" }}>نوع\u00A0الحركة</th>
          <th style={{ ...thRight, width: "14%" }}>التاريخ</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              style={{
                ...tdCenter,
                padding: "32px",
                color: P.slate300,
              }}
            >
              لا\u00A0توجد\u00A0حركات\u00A0مسجلة\u00A0على\u00A0هذا\u00A0الحساب
            </td>
          </tr>
        ) : (
          rows.map((m, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? P.white : P.slate50 }}>
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
              <td style={{ ...tdRight, color: P.slate900 }}>{m.description}</td>
              <td style={tdRight}>
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: P.blueLight,
                    border: `1px solid ${P.blueFade}`,
                    color: P.blue,
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.type}
                </span>
              </td>
              <td style={{ ...tdRight, color: P.slate600, fontWeight: "600", whiteSpace: "nowrap" }}>
                {new Date(m.date).toISOString().split("T")[0]}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <td
            colSpan={2}
            style={{
              padding: "12px 14px",
              color: P.white,
              fontWeight: "900",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            {n(bal)}{" "}
            <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.9 }}>
              ({balLabel})
            </span>
          </td>
          <td
            colSpan={3}
            style={{
              padding: "12px 14px",
              color: P.white,
              fontWeight: "700",
              fontSize: "13px",
              textAlign: "right",
            }}
          >
            الرصيد\u00A0المستحق\u00A0النهائي
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
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <th style={{ ...thCenter, width: "18%", borderRight: "none" }}>صافي\u00A0الرصيد</th>
          <th style={{ ...thCenter, width: "18%" }}>إجمالي\u00A0المدفوعات</th>
          <th style={{ ...thCenter, width: "18%" }}>إجمالي\u00A0الفواتير</th>
          <th style={{ ...thCenter, width: "18%" }}>حالة\u00A0الحساب</th>
          <th style={{ ...thRight, width: "23%" }}>اسم\u00A0{typeLabel}</th>
          <th style={{ ...thCenter, width: "5%" }}>#</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const isD = r.netBalance > 0;
          const isC = r.netBalance < 0;
          return (
            <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? P.white : P.slate50 }}>
              {/* 1. Net Balance */}
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
                    minWidth: "90px",
                    backgroundColor: isD ? P.rose50 : isC ? P.green50 : P.slate100,
                    border: `1px solid ${isD ? P.rose200 : isC ? P.green200 : P.border}`,
                    color: isD ? P.rose700 : isC ? P.green700 : P.slate600,
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {r.statusLabel}
                </span>
              </td>
              {/* 5. Entity Name */}
              <td style={{ ...tdRight, color: P.slate900, fontWeight: "800", fontSize: "13px" }}>
                {r.name}
              </td>
              {/* 6. Index */}
              <td style={{ ...tdCenter, color: P.slate600, fontWeight: "600" }}>
                {i + 1}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "15px" }}>
            {n(totals.balance)}
          </td>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.credit)}
          </td>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.debit)}
          </td>
          <td colSpan={3} style={{ padding: "12px 14px", color: P.white, fontWeight: "700", fontSize: "13px", textAlign: "right" }}>
            إجمالي\u00A0كافة\u00A0الحسابات
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
  const balSub = bal > 0 ? "عليه\u00A0ديون" : bal < 0 ? "له\u00A0مستحقات" : "خالص";

  const docTitle = isAll
    ? `كشف\u00A0مجمع\u00A0شامل`
    : `كشف\u00A0حساب\u00A0${typeLabel}`;

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
        direction: "ltr",
        textAlign: "right",
        fontSize: "13px",
        lineHeight: "1.5",
        boxSizing: "border-box",
        color: P.slate900,
      }}
    >
      {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${P.blueDark} 0%, ${P.blue} 60%, #0ea5e9 100%)`,
          padding: "22px 32px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Right Side: Brand & Logo */}
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.30)",
              border: "1.5px solid rgba(255,255,255,0.30)",
              borderRadius: "14px",
              padding: "9px 18px",
              color: P.white,
              fontWeight: "900",
              fontSize: "20px",
              letterSpacing: "1px",
            }}
          >
            RTX
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: P.white, fontWeight: "900", fontSize: "18px", lineHeight: "1.2" }}>
              RTX\u00A0للتجارة\u00A0والتصنيع
            </div>
            <div style={{ color: P.blueText, fontSize: "12px", marginTop: "4px" }}>
              نظام\u00A0إدارة\u00A0الحسابات\u00A0والمالية
            </div>
          </div>
        </div>

        {/* Left Side: Document Title & Date */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.30)",
              borderRadius: "12px",
              padding: "8px 20px",
              color: P.white,
              fontWeight: "800",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            {docTitle}
          </div>
          <div style={{ color: P.blueText, fontSize: "12px", marginTop: "6px" }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* ═══ ACCENT STRIP ════════════════════════════════════════════════════ */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(to left, ${P.blueDark}, ${P.blueText}, ${P.blueDark})`,
        }}
      />

      {/* ═══ ENTITY BAR ══════════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: P.blueLight,
          borderBottom: `1px solid ${P.border}`,
          padding: "12px 32px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Right side: Entity Name */}
        <div>
          <span style={{ color: P.slate600, fontSize: "13px", fontWeight: "600" }}>
            اسم\u00A0الحساب:\u00A0
          </span>
          <span style={{ color: P.slate900, fontWeight: "900", fontSize: "16px" }}>
            {entityName}
          </span>
        </div>
        {/* Left side: Type Label Badge */}
        <div
          style={{
            backgroundColor: P.blue,
            color: P.white,
            borderRadius: "20px",
            padding: "4px 18px",
            fontSize: "12px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* ═══ SUMMARY CARDS ════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "14px",
          padding: "18px 32px",
          backgroundColor: P.slate50,
          borderBottom: `1px solid ${P.border}`,
        }}
      >
        {/* Card 1 (Rightmost in row-reverse order if grid) -> We reverse array in grid */}
        <Card
          label="رصيد\u00A0افتتاحي"
          value={n(totals.opening)}
          sub="جنيه"
          bg={P.white}
          bord={P.border}
          col={P.slate900}
          labCol={P.slate600}
          subCol={P.slate300}
        />
        <Card
          label={isAll ? "إجمالي\u00A0الفواتير" : "المدين"}
          value={n(totals.debit)}
          sub="جنيه"
          bg={P.rose50}
          bord={P.rose200}
          col={P.rose700}
          labCol={P.rose700}
          subCol="#fca5a5"
        />
        <Card
          label={isAll ? "إجمالي\u00A0المدفوعات" : "الدائن"}
          value={n(totals.credit)}
          sub="جنيه"
          bg={P.green50}
          bord={P.green200}
          col={P.green700}
          labCol={P.green700}
          subCol="#6ee7b7"
        />
        <Card
          label="الرصيد\u00A0النهائي"
          value={n(bal)}
          sub={balSub}
          bg={P.blue}
          bord={P.blueDark}
          col={P.white}
          labCol={P.blueText}
          subCol={P.blueText}
          glow
        />
      </div>

      {/* ═══ TABLE AREA ═══════════════════════════════════════════════════════ */}
      <div style={{ padding: "24px 32px" }}>
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
          padding: "12px 32px",
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: P.slate50,
        }}
      >
        <div style={{ color: P.slate600, fontSize: "11px" }}>
          هذه\u00A0الوثيقة\u00A0صادرة\u00A0إلكترونياً\u00A0من\u00A0نظام\u00A0RTX\u00A0—\u00A0جميع\u00A0الحقوق\u00A0محفوظة
        </div>
        <div style={{ color: P.blue, fontSize: "11px", fontWeight: "700" }}>
          RTX\u00A0System\u00A0·\u00A0{dateStr}
        </div>
      </div>
    </div>
  );
}
