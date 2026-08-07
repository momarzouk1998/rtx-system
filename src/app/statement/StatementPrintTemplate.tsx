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

  let statusText = "خالص";
  let statusTextColor: string = C.white;
  if (bal > 0) {
    statusText = "عليه ديون";
    statusTextColor = "#fecdd3"; // soft red text
  } else if (bal < 0) {
    statusText = "له مستحقات";
    statusTextColor = "#a7f3d0"; // soft green text
  }

  return (
    /* Outer container allows horizontal scrolling on small screens while keeping document at fixed 800px width */
    <div className="statement-wrapper-container" style={{ width: "100%", overflowX: "auto", paddingBottom: "1rem" }}>
      <div
        id="statement"
        data-print-id="printable-client-statement"
        className="printable-statement-content print-template-root"
        style={{
          width: "800px",
          minWidth: "800px",
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
        {/* ═══ 1. TOP ACCENT LINE ════════════════════════════════════════════════ */}
        <div
          style={{
            height: "4px",
            width: "100%",
            background: "linear-gradient(90deg, #0ea5e9 0%, #0284c7 50%, #0f172a 100%)",
          }}
        />

        {/* ═══ 2. HEADER CONTENT ═════════════════════════════════════════════════ */}
        <div
          style={{
            padding: "1.2rem 1.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: C.white,
            borderBottom: "2px solid #0f172a",
          }}
        >
          {/* Right side: Logo & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#090d16",
                borderRadius: "12px",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                src="/rtx-logo.png"
                alt="RTX Logo"
                style={{ height: "36px", width: "auto", display: "block" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.35rem",
                  fontWeight: "900",
                  color: "#0f172a",
                  lineHeight: "1.2",
                }}
              >
                RTX للتجارة والتصنيع
              </div>
            </div>
          </div>

          {/* Left side: Badge & Date */}
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                display: "inline-block",
                background: "linear-gradient(90deg, #0f172a 0%, #0284c7 100%)",
                color: "#ffffff",
                padding: "5px 18px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "800",
                boxShadow: "0 2px 6px rgba(2,132,199,0.25)",
              }}
            >
              {isAll
                ? typeLabel.includes("مورد")
                  ? "كشف مجمع — الموردين"
                  : typeLabel.includes("مصنع")
                  ? "كشف مجمع — المصانع"
                  : "كشف مجمع — العملاء"
                : `كشف حساب ${typeLabel}`}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                fontWeight: "700",
                marginTop: "6px",
              }}
            >
              تاريخ الاستخراج: {dateStr}
            </div>
          </div>
        </div>

        {/* ═══ 2. BODY ══════════════════════════════════════════════════════════ */}
        <div style={{ padding: "1.5rem 1.8rem" }}>
          {/* Simple Account Bar for Single Entity */}
          {!isAll && (
            <div
              style={{
                backgroundColor: C.lightBg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                padding: "0.8rem 1.2rem",
                marginBottom: "1.2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ color: C.slate600, fontSize: "0.9rem", fontWeight: "600" }}>
                  اسم {typeLabel}:{" "}
                </span>
                <span style={{ color: C.text, fontWeight: "800", fontSize: "1.2rem" }}>
                  {entityName}
                </span>
              </div>
            </div>
          )}

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
                {summaryRows.map((r, i) => {
                  const textColor = r.netBalance > 0 ? C.danger : r.netBalance < 0 ? C.success : C.slate600;
                  return (
                    <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? C.white : C.lightBg }}>
                      <td style={{ padding: "9px", textAlign: "center", border: `1px solid ${C.border}` }}>{i + 1}</td>
                      <td style={{ padding: "9px", fontWeight: "700", border: `1px solid ${C.border}` }}>{r.name}</td>
                      <td style={{ padding: "9px", textAlign: "center", border: `1px solid ${C.border}` }}>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "800",
                            color: textColor,
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
                  );
                })}
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
            <div style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "0.4rem" }}>
              الرصيد النهائي المستحق
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "0.4rem" }}>
              {n(bal)} جنيه
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: statusTextColor,
                }}
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
