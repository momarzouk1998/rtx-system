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

    if (!item) {
      return { success: false, error: "وصف المصروف مطلوب" };
    }
    if (!amount || amount <= 0) {
      return { success: false, error: "أدخل مبلغاً صحيحاً" };
    }

    const validCategory = category === "FACTORY" || category === "SUPPLIER" ? category : "INTERNAL";

    await prisma.expense.create({
      data: {
        category: validCategory,
        item,
        amount,
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
