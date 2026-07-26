'use server';

import { prisma } from "@/lib/prisma";

export async function getTreasuryData() {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  // 1. Fetch all Payments (IN)
  const payments = await prisma.payment.findMany({
    include: { client: true },
    orderBy: { date: 'desc' },
  });

  // 2. Fetch all Expenses (OUT)
  const expenses = await prisma.expense.findMany({
    include: { supplier: true, factory: true },
    orderBy: { date: 'desc' },
  });

  // Combine into single transaction list
  const transactions = [
    ...payments.map(p => ({
      id: `p-${p.id}`,
      date: p.date,
      dateString: p.date.toISOString().split('T')[0],
      category: p.paymentType === 'DEBT_PAYMENT' ? 'سداد مديونية' : 
                p.paymentType === 'REFUND' ? 'إرتجاع' :
                p.paymentType === 'DEPOSIT' ? 'تأمين' :
                p.paymentType === 'ON_ACCOUNT' ? 'تحت الحساب' : 'أخرى',
      description: p.notes || `دفعة من العميل: ${p.client.name}`,
      amount: p.amount,
      type: 'IN' as const,
    })),
    ...expenses.map(e => ({
      id: `e-${e.id}`,
      date: e.date,
      dateString: e.date.toISOString().split('T')[0],
      category: e.category === 'INTERNAL' ? 'مصاريف داخلية' :
                e.category === 'FACTORY' ? 'دفعة لمصنع' : 'دفعة لمورد',
      description: e.item || (e.supplier ? `مورد: ${e.supplier.name}` : e.factory ? `مصنع: ${e.factory.name}` : ''),
      amount: e.amount,
      type: 'OUT' as const,
    }))
  ];

  // Filter out the opening balance from transactions to handle it separately
  const openingBalanceTxIndex = transactions.findIndex(t => t.type === 'OUT' && t.description === 'رصيد افتتاحي');
  let openingBalance = 0;
  if (openingBalanceTxIndex !== -1) {
    openingBalance = transactions[openingBalanceTxIndex].amount;
    transactions.splice(openingBalanceTxIndex, 1);
  }

  // Sort by date descending
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  let monthIn = 0;
  let monthOut = 0;

  for (const t of transactions) {
    if (t.type === 'IN') {
      totalIn += t.amount;
      if (t.date >= currentMonthStart) monthIn += t.amount;
    } else {
      totalOut += t.amount;
      if (t.date >= currentMonthStart) monthOut += t.amount;
    }
  }

  const currentBalance = openingBalance + totalIn - totalOut;

  return {
    transactions,
    currentBalance,
    openingBalance,
    monthIn,
    monthOut,
  };
}

export async function setOpeningBalance(amount: number) {
  try {
    const existing = await prisma.expense.findFirst({
      where: { item: 'رصيد افتتاحي', category: 'INTERNAL' }
    });

    if (existing) {
      await prisma.expense.update({
        where: { id: existing.id },
        data: { amount }
      });
    } else {
      await prisma.expense.create({
        data: {
          category: 'INTERNAL',
          item: 'رصيد افتتاحي',
          amount,
          date: new Date(2000, 0, 1) // Very old date so it doesn't affect recent metrics
        }
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error setting opening balance:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ الرصيد الافتتاحي" };
  }
}
