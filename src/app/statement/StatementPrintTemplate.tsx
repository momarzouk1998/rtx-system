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

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  blue: "#0284c7",
  blueDark: "#0369a1",
  blueFade: "#e0f2fe",
  blueLight: "#f0f9ff",
  blueText: "#bae6fd",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
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
  white: "#ffffff",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const n = (v: number) =>
  Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0 });

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: P.white,
  fontWeight: "700",
  fontSize: "12px",
  textAlign: "right",
  borderLeft: "1px solid rgba(255,255,255,0.15)",
  whiteSpace: "nowrap",
  backgroundColor: "transparent",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: `1px solid ${P.slate200}`,
  fontSize: "12px",
  color: P.slate700,
  textAlign: "right",
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
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  bg: string;
  bord: string;
  col: string;
  labCol: string;
  subCol: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: bg,
        border: `1.5px solid ${bord}`,
        borderRadius: "12px",
        padding: "14px 10px",
        textAlign: "center",
        boxShadow: highlight
          ? "0 4px 12px rgba(2,132,199,0.2)"
          : "0 1px 3px rgba(0,0,0,0.03)",
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
      <div style={{ color: col, fontSize: "19px", fontWeight: "900", lineHeight: "1.2" }}>
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
  const balLabel = bal > 0 ? "عليه ديون" : bal < 0 ? "له مستحقات" : "خالص";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <th style={thStyle}>التاريخ</th>
          <th style={thStyle}>نوع الحركة</th>
          <th style={{ ...thStyle, width: "38%" }}>البيان والتفاصيل</th>
          <th style={{ ...thStyle, textAlign: "center" }}>عليه (مدين)</th>
          <th style={{ ...thStyle, textAlign: "center", borderLeft: "none" }}>له (دائن)</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              style={{
                ...tdStyle,
                textAlign: "center",
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
              <td style={{ ...tdStyle, color: P.slate600, fontWeight: "600", whiteSpace: "nowrap" }}>
                {new Date(m.date).toISOString().split("T")[0]}
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: P.blueLight,
                    border: `1px solid ${P.blueFade}`,
                    color: P.blue,
                    padding: "2px 10px",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.type}
                </span>
              </td>
              <td style={{ ...tdStyle, color: P.slate900 }}>{m.description}</td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "center",
                  backgroundColor: m.debit > 0 ? P.rose50 : "transparent",
                  color: m.debit > 0 ? P.rose700 : P.slate300,
                  fontWeight: m.debit > 0 ? "700" : "400",
                }}
              >
                {m.debit > 0 ? n(m.debit) : "—"}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "center",
                  backgroundColor: m.credit > 0 ? P.green50 : "transparent",
                  color: m.credit > 0 ? P.green700 : P.slate300,
                  fontWeight: m.credit > 0 ? "700" : "400",
                }}
              >
                {m.credit > 0 ? n(m.credit) : "—"}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <td
            colSpan={3}
            style={{
              padding: "12px 14px",
              color: P.white,
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            الرصيد المستحق النهائي
          </td>
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
    <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
      <thead>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <th style={{ ...thStyle, textAlign: "center", width: "40px" }}>#</th>
          <th style={thStyle}>اسم {typeLabel}</th>
          <th style={{ ...thStyle, textAlign: "center", width: "130px" }}>حالة الحساب</th>
          <th style={{ ...thStyle, textAlign: "center", width: "130px" }}>إجمالي الفواتير</th>
          <th style={{ ...thStyle, textAlign: "center", width: "130px" }}>إجمالي المدفوعات</th>
          <th style={{ ...thStyle, textAlign: "center", width: "140px", borderLeft: "none" }}>
            صافي الرصيد
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const isD = r.netBalance > 0;
          const isC = r.netBalance < 0;
          return (
            <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? P.white : P.slate50 }}>
              <td style={{ ...tdStyle, textAlign: "center", color: P.slate600, fontWeight: "600" }}>
                {i + 1}
              </td>
              <td style={{ ...tdStyle, color: P.slate900, fontWeight: "800", fontSize: "13px" }}>
                {r.name}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    minWidth: "85px",
                    backgroundColor: isD ? P.rose50 : isC ? P.green50 : P.slate100,
                    border: `1px solid ${isD ? P.rose200 : isC ? P.green200 : P.slate200}`,
                    color: isD ? P.rose700 : isC ? P.green700 : P.slate600,
                    padding: "3px 10px",
                    borderRadius: "16px",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {r.statusLabel}
                </span>
              </td>
              <td style={{ ...tdStyle, textAlign: "center", color: P.rose700, fontWeight: "700" }}>
                {n(r.totalInvoices)}
              </td>
              <td style={{ ...tdStyle, textAlign: "center", color: P.green700, fontWeight: "700" }}>
                {n(r.totalPayments)}
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "center",
                  color: isD ? P.rose700 : isC ? P.green700 : P.slate600,
                  fontWeight: "900",
                  fontSize: "13px",
                }}
              >
                {n(r.netBalance)}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr style={{ background: `linear-gradient(to left, ${P.blueDark}, ${P.blue})` }}>
          <td colSpan={3} style={{ padding: "12px 14px", color: P.white, fontWeight: "700", fontSize: "13px" }}>
            إجمالي كافة الحسابات
          </td>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.debit)}
          </td>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "13px" }}>
            {n(totals.credit)}
          </td>
          <td style={{ padding: "12px 14px", color: P.white, fontWeight: "900", textAlign: "center", fontSize: "15px" }}>
            {n(totals.balance)}
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
  const balSub = bal > 0 ? "عليه ديون" : bal < 0 ? "له مستحقات" : "خالص";

  const docTitle = isAll
    ? `كشف مجمع شامل`
    : `كشف حساب ${typeLabel}`;

  return (
    <div
      id="printable-client-statement"
      className="print-template-root"
      style={{
        width: "100%",
        backgroundColor: P.white,
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
        direction: "rtl",
        textAlign: "right",
        fontSize: "13px",
        lineHeight: "1.5",
        boxSizing: "border-box",
        color: P.slate900,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${P.slate200}`,
      }}
    >
      {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${P.blueDark} 0%, ${P.blue} 60%, #0ea5e9 100%)`,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Right Side: Brand & Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.30)",
              border: "1.5px solid rgba(255,255,255,0.30)",
              borderRadius: "12px",
              padding: "8px 16px",
              color: P.white,
              fontWeight: "900",
              fontSize: "18px",
            }}
          >
            RTX
          </div>
          <div>
            <div style={{ color: P.white, fontWeight: "900", fontSize: "18px", lineHeight: "1.2" }}>
              RTX للتجارة والتصنيع
            </div>
            <div style={{ color: P.blueText, fontSize: "12px", marginTop: "2px" }}>
              نظام إدارة الحسابات والمالية
            </div>
          </div>
        </div>

        {/* Left Side: Document Title & Date */}
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.30)",
              borderRadius: "10px",
              padding: "7px 18px",
              color: P.white,
              fontWeight: "800",
              fontSize: "13px",
              whiteSpace: "nowrap",
            }}
          >
            {docTitle}
          </div>
          <div style={{ color: P.blueText, fontSize: "11px", marginTop: "4px", textAlign: "center" }}>
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
          borderBottom: `1px solid ${P.slate200}`,
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ color: P.slate600, fontSize: "13px", fontWeight: "600" }}>
            اسم الحساب:{" "}
          </span>
          <span style={{ color: P.slate900, fontWeight: "900", fontSize: "15px" }}>
            {entityName}
          </span>
        </div>
        <div
          style={{
            backgroundColor: P.blue,
            color: P.white,
            borderRadius: "16px",
            padding: "4px 16px",
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
          display: "flex",
          gap: "12px",
          padding: "16px 24px",
          backgroundColor: P.slate50,
          borderBottom: `1px solid ${P.slate200}`,
        }}
      >
        <Card
          label="رصيد افتتاحي"
          value={n(totals.opening)}
          sub="جنيه"
          bg={P.white}
          bord={P.slate200}
          col={P.slate900}
          labCol={P.slate600}
          subCol={P.slate300}
        />
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
        <Card
          label="الرصيد النهائي"
          value={n(bal)}
          sub={balSub}
          bg={P.blue}
          bord={P.blueDark}
          col={P.white}
          labCol={P.blueText}
          subCol={P.blueText}
          highlight
        />
      </div>

      {/* ═══ TABLE AREA ═══════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 24px" }}>
        {isAll ? (
          <SummaryTable rows={summaryRows} typeLabel={typeLabel} totals={totals} />
        ) : (
          <MovementsTable rows={movements} totals={totals} />
        )}
      </div>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: `1px solid ${P.slate200}`,
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: P.slate50,
        }}
      >
        <div style={{ color: P.slate600, fontSize: "11px" }}>
          هذه الوثيقة صادرة إلكترونياً من نظام RTX — جميع الحقوق محفوظة
        </div>
        <div style={{ color: P.blue, fontSize: "11px", fontWeight: "700" }}>
          RTX System · {dateStr}
        </div>
      </div>
    </div>
  );
}
