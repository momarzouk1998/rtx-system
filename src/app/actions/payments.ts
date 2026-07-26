'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// إضافة دفعة من عميل
export async function createPayment(data: FormData) {
  try {
    const clientId = data.get("clientId") as string;
    const amount = parseFloat(data.get("amount") as string);
    const method = data.get("method") as string;
    const paymentType = data.get("paymentType") as string;
    const notes = data.get("notes") as string;

    if (!clientId) {
      return { success: false, error: "اختر العميل أولاً" };
    }
    if (!amount || amount <= 0) {
      return { success: false, error: "أدخل مبلغاً صحيحاً" };
    }

    const validMethods = ["CASH", "WALLET", "INSTAPAY", "BANK_TRANSFER"];
    const validTypes = ["DEBT_PAYMENT", "REFUND", "DEPOSIT", "ON_ACCOUNT", "OTHER"];

    await prisma.payment.create({
      data: {
        clientId,
        amount,
        method: method && validMethods.includes(method)
          ? (method as "CASH" | "WALLET" | "INSTAPAY" | "BANK_TRANSFER")
          : null,
        paymentType: paymentType && validTypes.includes(paymentType)
          ? (paymentType as "DEBT_PAYMENT" | "REFUND" | "DEPOSIT" | "ON_ACCOUNT" | "OTHER")
          : "DEBT_PAYMENT",
        notes: notes || null,
      },
    });

    revalidatePath("/payments");
    return { success: true };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدفعة" };
  }
}

export async function updatePayment(id: string, data: FormData) {
  try {
    const clientId = data.get("clientId") as string;
    const amount = parseFloat(data.get("amount") as string);
    const method = data.get("method") as string;
    const paymentType = data.get("paymentType") as string;
    const notes = data.get("notes") as string;

    if (!clientId) {
      return { success: false, error: "اختر العميل أولاً" };
    }
    if (!amount || amount <= 0) {
      return { success: false, error: "أدخل مبلغاً صحيحاً" };
    }

    const validMethods = ["CASH", "WALLET", "INSTAPAY", "BANK_TRANSFER"];
    const validTypes = ["DEBT_PAYMENT", "REFUND", "DEPOSIT", "ON_ACCOUNT", "OTHER"];

    await prisma.payment.update({
      where: { id },
      data: {
        clientId,
        amount,
        method: method && validMethods.includes(method)
          ? (method as "CASH" | "WALLET" | "INSTAPAY" | "BANK_TRANSFER")
          : null,
        paymentType: paymentType && validTypes.includes(paymentType)
          ? (paymentType as "DEBT_PAYMENT" | "REFUND" | "DEPOSIT" | "ON_ACCOUNT" | "OTHER")
          : "DEBT_PAYMENT",
        notes: notes || null,
      },
    });

    revalidatePath("/payments");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل الدفعة" };
  }
}

export async function deletePayment(id: string) {
  try {
    await prisma.payment.delete({
      where: { id },
    });

    revalidatePath("/payments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الدفعة" };
  }
}
