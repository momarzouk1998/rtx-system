'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// إضافة مصروف
export async function createExpense(data: FormData) {
  try {
    const category = data.get("category") as string; // INTERNAL | FACTORY | SUPPLIER
    const item = data.get("item") as string;
    const amount = parseFloat(data.get("amount") as string);
    const factoryId = data.get("factoryId") as string;
    const supplierId = data.get("supplierId") as string;
    const dateRaw = data.get("date") as string;

    if (!item) {
      return { success: false, error: "وصف المصروف مطلوب" };
    }
    if (!amount || amount <= 0) {
      return { success: false, error: "أدخل مبلغاً صحيحاً" };
    }

    const validCategory = category === "FACTORY" || category === "SUPPLIER" ? category : "INTERNAL";
    // التاريخ اللي دخله المستخدم، أو اليوم لو فاضي
    const date = dateRaw ? new Date(dateRaw) : new Date();

    await prisma.expense.create({
      data: {
        category: validCategory,
        item,
        amount,
        date,
        // factoryId يظهر فقط لو التصنيف FACTORY
        factoryId: validCategory === "FACTORY" && factoryId ? factoryId : null,
        // supplierId يظهر فقط لو التصنيف SUPPLIER
        supplierId: validCategory === "SUPPLIER" && supplierId ? supplierId : null,
      },
    });

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل المصروف" };
  }
}

export async function updateExpense(id: string, data: FormData) {
  try {
    const category = data.get("category") as string;
    const item = data.get("item") as string;
    const amount = parseFloat(data.get("amount") as string);
    const factoryId = data.get("factoryId") as string;
    const supplierId = data.get("supplierId") as string;
    const dateRaw = data.get("date") as string;

    if (!item) {
      return { success: false, error: "وصف المصروف مطلوب" };
    }
    if (!amount || amount <= 0) {
      return { success: false, error: "أدخل مبلغاً صحيحاً" };
    }

    const validCategory = category === "FACTORY" || category === "SUPPLIER" ? category : "INTERNAL";
    const date = dateRaw ? new Date(dateRaw) : new Date();

    await prisma.expense.update({
      where: { id },
      data: {
        category: validCategory,
        item,
        amount,
        date,
        factoryId: validCategory === "FACTORY" && factoryId ? factoryId : null,
        supplierId: validCategory === "SUPPLIER" && supplierId ? supplierId : null,
      },
    });

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المصروف" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المصروف" };
  }
}
