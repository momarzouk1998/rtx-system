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

// ─── Color Palette (From Rtx/statment/Statement.html) ─────────────────────────
const C = {
  blue: "#2298cd",
  darkBlue: "#1e7bb8",
  text: "#343a40",
  lightBg: "#f8f9fa",
  border: "#dee2e6",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  white: "#ffffff",
  slate600: "#6c757d",
} as const;

const n = (v: number) =>
  Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0 });

export function StatementPrintTemplate({ data }: { data: StatementPrintData }) {
  const { entityName, typeLabel, isAll, dateStr, totals, movements, summaryRows } = data;
  const bal = totals.balance;

  // Determine badge color & status text
  let statusText = "خالص";
  let statusBg: string = C.success;
  if (bal > 0) {
    statusText = "عليه ديون";
    statusBg = C.danger;
  } else if (bal < 0) {
    statusText = "له مستحقات";
    statusBg = C.success;
  }

  return (
    <div
      id="statement"
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: C.white,
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        fontFamily: "'Cairo', sans-serif",
        direction: "rtl",
        textAlign: "right",
        color: C.text,
        boxSizing: "border-box",
      }}
    >
      {/* ═══ 1. HEADER ════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.darkBlue})`,
          color: C.white,
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: C.white, margin: 0 }}>
            RTX للتجارة والتصنيع
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>
            RTX Trading &amp; Manufacturing
          </div>
        </div>
        <h2 style={{ fontWeight: "700", margin: 0, fontSize: "1.3rem", color: C.white }}>
          {isAll ? `كشف مجمع — ${typeLabel}ين` : `كشف حساب ${typeLabel}`}
        </h2>
      </div>

      {/* ═══ 2. BODY ══════════════════════════════════════════════════════════ */}
      <div style={{ padding: "1.8rem" }}>
        {/* Main Title */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontWeight: "800",
              color: C.blue,
              fontSize: "1.8rem",
              margin: "0 0 0.4rem 0",
            }}
          >
            كــشــف حــســاب
          </h1>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: C.blue,
              margin: "0 auto",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Client Name Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.darkBlue})`,
            color: C.white,
            borderRadius: "8px",
            padding: "1rem 1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.2rem" }}>
            اسم {typeLabel}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: "800" }}>{entityName}</div>
        </div>

        {/* Info Grid (Date & Period) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: C.lightBg,
              borderRadius: "8px",
              padding: "0.9rem 1rem",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: C.slate600, marginBottom: "0.2rem" }}>
              تاريخ الاستخراج
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.blue }}>
              {dateStr}
            </div>
          </div>

          <div
            style={{
              backgroundColor: C.lightBg,
              borderRadius: "8px",
              padding: "0.9rem 1rem",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: C.slate600, marginBottom: "0.2rem" }}>
              فترة الكشف
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.blue }}>
              {isAll ? "شامل كل الحسابات" : "كشف حساب كامل"}
            </div>
          </div>
        </div>

        {/* Financial Section Title */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h3 style={{ color: C.blue, fontWeight: "700", fontSize: "1.3rem", margin: 0 }}>
            التفاصيل المالية
          </h3>
          <div
            style={{
              width: "50px",
              height: "2px",
              backgroundColor: C.blue,
              margin: "0.3rem auto 0.8rem",
            }}
          />
        </div>

        {/* Financial Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Card 1: Opening Balance */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.white}, ${C.lightBg})`,
              border: `2px solid ${C.blue}`,
              borderRadius: "10px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: C.slate600, marginBottom: "0.4rem" }}>
              رصيد افتتاحي
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: C.blue }}>
              {n(totals.opening)}
            </div>
          </div>

          {/* Card 2: Invoices / Debit */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.white}, ${C.lightBg})`,
              border: `2px solid ${C.danger}`,
              borderRadius: "10px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: C.slate600, marginBottom: "0.4rem" }}>
              {isAll ? "إجمالي الفواتير" : "المدين (عليه)"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: C.danger }}>
              {n(totals.debit)}
            </div>
          </div>

          {/* Card 3: Payments / Credit */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.white}, ${C.lightBg})`,
              border: `2px solid ${C.success}`,
              borderRadius: "10px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: C.slate600, marginBottom: "0.4rem" }}>
              {isAll ? "إجمالي المدفوعات" : "الدائن (له)"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: C.success }}>
              {n(totals.credit)}
            </div>
          </div>
        </div>

        {/* ═══ TABLE ═════════════════════════════════════════════════════════ */}
        {isAll ? (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ backgroundColor: C.blue, color: C.white }}>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>#</th>
                <th style={{ padding: "10px", textAlign: "right", border: `1px solid ${C.border}` }}>اسم {typeLabel}</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>حالة الحساب</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>إجمالي الفواتير</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>إجمالي المدفوعات</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>صافي الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r, i) => (
                <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? C.white : C.lightBg }}>
                  <td style={{ padding: "9px", textAlign: "center", border: `1px solid ${C.border}` }}>{i + 1}</td>
                  <td style={{ padding: "9px", fontWeight: "700", border: `1px solid ${C.border}` }}>{r.name}</td>
                  <td style={{ padding: "9px", textAlign: "center", border: `1px solid ${C.border}` }}>
                    <span
                      style={{
                        padding: "3px 12px",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        color: C.white,
                        backgroundColor: r.netBalance > 0 ? C.danger : r.netBalance < 0 ? C.success : C.slate600,
                      }}
                    >
                      {r.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: "9px", textAlign: "center", fontWeight: "700", color: C.danger, border: `1px solid ${C.border}` }}>
                    {n(r.totalInvoices)}
                  </td>
                  <td style={{ padding: "9px", textAlign: "center", fontWeight: "700", color: C.success, border: `1px solid ${C.border}` }}>
                    {n(r.totalPayments)}
                  </td>
                  <td style={{ padding: "9px", textAlign: "center", fontWeight: "800", color: C.blue, border: `1px solid ${C.border}` }}>
                    {n(r.netBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
            <thead>
              <tr style={{ backgroundColor: C.blue, color: C.white }}>
                <th style={{ padding: "10px", textAlign: "right", border: `1px solid ${C.border}` }}>التاريخ</th>
                <th style={{ padding: "10px", textAlign: "right", border: `1px solid ${C.border}` }}>نوع الحركة</th>
                <th style={{ padding: "10px", textAlign: "right", border: `1px solid ${C.border}`, width: "40%" }}>البيان والتفاصيل</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>عليه (مدين)</th>
                <th style={{ padding: "10px", textAlign: "center", border: `1px solid ${C.border}` }}>له (دائن)</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? C.white : C.lightBg }}>
                  <td style={{ padding: "9px", border: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                    {new Date(m.date).toISOString().split("T")[0]}
                  </td>
                  <td style={{ padding: "9px", border: `1px solid ${C.border}` }}>
                    <span
                      style={{
                        backgroundColor: C.lightBg,
                        border: `1px solid ${C.border}`,
                        color: C.blue,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                      }}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td style={{ padding: "9px", border: `1px solid ${C.border}` }}>{m.description}</td>
                  <td style={{ padding: "9px", textAlign: "center", fontWeight: "700", color: m.debit > 0 ? C.danger : C.slate600, border: `1px solid ${C.border}` }}>
                    {m.debit > 0 ? n(m.debit) : "—"}
                  </td>
                  <td style={{ padding: "9px", textAlign: "center", fontWeight: "700", color: m.credit > 0 ? C.success : C.slate600, border: `1px solid ${C.border}` }}>
                    {m.credit > 0 ? n(m.credit) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Balance Summary Card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.darkBlue})`,
            color: C.white,
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(34, 152, 205, 0.3)",
          }}
        >
          <div style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "0.5rem" }}>
            الرصيد النهائي المستحق
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "0.8rem" }}>
            {n(bal)} جنيه
          </div>
          <div>
            <span
              style={{
                fontSize: "1rem",
                padding: "0.4rem 1.2rem",
                borderRadius: "20px",
                backgroundColor: statusBg,
                color: C.white,
                fontWeight: "700",
                display: "inline-block",
              }}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
