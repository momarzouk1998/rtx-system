'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type InvoiceItem = {
  productId: string;
  quantity: number;
};

export async function createSalesInvoice(data: FormData) {
  try {
    const clientId = data.get("clientId") as string;
    const itemsRaw = data.get("items") as string;
    const discountValue = parseFloat(data.get("discountValue") as string) || 0;
    const notes = data.get("notes") as string;
    const paymentMethod = data.get("paymentMethod") as "CASH" | "WALLET" | "INSTAPAY" | "BANK_TRANSFER";

    if (!clientId || !itemsRaw) {
      return { success: false, error: "العميل والأصناف مطلوبة" };
    }

    const items: InvoiceItem[] = JSON.parse(itemsRaw);
    if (items.length === 0) {
      return { success: false, error: "يجب إضافة صنف واحد على الأقل" };
    }

    // Get all products data for calculations
    const products = await prisma.product.findMany({
      where: { id: { in: items.map(i => i.productId) } }
    });

    let subTotal = 0;
    let totalProfit = 0;

    const invoiceItemsData = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const lineTotal = item.quantity * product.bagPrice;
      const lineProfitTotal = item.quantity * product.profitPerBag;

      subTotal += lineTotal;
      totalProfit += lineProfitTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        bagPrice: product.bagPrice,
        lineTotal,
        profitPerBag: product.profitPerBag,
        lineProfitTotal,
      };
    });

    const netTotal = subTotal - discountValue;

    await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          clientId,
          subTotal,
          discountValue,
          netTotal,
          totalProfit,
          status: "ORDERED",
          paymentMethod,
          notes: notes || null,
          items: {
            create: invoiceItemsData
          }
        },
      });

      // 2. Out Transactions for bags
      for (const item of invoiceItemsData) {
        await tx.inventoryTransaction.create({
          data: {
            type: "OUT",
            reason: "SALES",
            quantity: item.quantity,
            productId: item.productId,
            referenceId: invoice.id,
          }
        });
      }
    });

    revalidatePath("/sales-stage");
    return { success: true };
  } catch (error) {
    console.error("Error creating sales invoice:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة الفاتورة" };
  }
}

// تحديث حالة طلب (لصفحة متابعة الطلبات)
export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const validStatus = ["PROCESSING", "ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)
      ? (status as "PROCESSING" | "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED")
      : "PROCESSING";

    await prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: { status: validStatus },
    });

    revalidatePath("/orders-track");
    revalidatePath("/sales-stage");
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث الحالة" };
  }
}
