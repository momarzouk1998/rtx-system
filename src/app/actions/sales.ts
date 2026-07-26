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
    const dateRaw = data.get("date") as string;

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
    // التاريخ اللي دخله المستخدم، أو اليوم لو فاضي
    const date = dateRaw ? new Date(dateRaw) : new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          clientId,
          date,
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

export async function updateSalesInvoice(id: string, data: FormData) {
  try {
    const clientId = data.get("clientId") as string;
    const itemsRaw = data.get("items") as string;
    const discountValue = parseFloat(data.get("discountValue") as string) || 0;
    const notes = data.get("notes") as string;
    const paymentMethod = data.get("paymentMethod") as "CASH" | "WALLET" | "INSTAPAY" | "BANK_TRANSFER";
    const dateRaw = data.get("date") as string;

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
    // التاريخ اللي دخله المستخدم، أو اليوم لو فاضي
    const date = dateRaw ? new Date(dateRaw) : new Date();

    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { invoiceId: id }
    });

    // Delete existing inventory transactions for this invoice
    await prisma.inventoryTransaction.deleteMany({
      where: { referenceId: id }
    });

    await prisma.$transaction(async (tx) => {
      // 1. Update Invoice
      const invoice = await tx.salesInvoice.update({
        where: { id },
        data: {
          clientId,
          date,
          subTotal,
          discountValue,
          netTotal,
          totalProfit,
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
    revalidatePath("/orders-track");
    return { success: true };
  } catch (error) {
    console.error("Error updating sales invoice:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل الفاتورة" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Get invoice with items
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!invoice) {
      return { success: false, error: "الفاتورة غير موجودة" };
    }

    if (invoice.items.length > 0) {
      return { success: false, error: `لا يمكن حذف الفاتورة لأنها تحتوي على ${invoice.items.length} صنف.` };
    }

    await prisma.salesInvoice.delete({
      where: { id },
    });

    revalidatePath("/sales-stage");
    revalidatePath("/orders-track");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الفاتورة" };
  }
}
