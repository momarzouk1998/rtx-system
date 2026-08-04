'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addInventoryTransactionAction(data: FormData) {
  try {
    const itemType = data.get("itemType") as "MATERIAL" | "PRODUCT"; // خامة أو منتج
    const type = data.get("type") as "IN" | "OUT"; // وارد أو منصرف
    const reasonRaw = data.get("reason") as string;
    const materialId = data.get("materialId") as string;
    const productId = data.get("productId") as string;
    const quantity = parseFloat(data.get("quantity") as string);
    const notes = data.get("notes") as string;
    const dateRaw = data.get("date") as string;

    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "يجب إدخال كمية صحيحة أكبر من صفر" };
    }

    if (itemType === "MATERIAL" && !materialId) {
      return { success: false, error: "يجب اختيار الخامة" };
    }

    if (itemType === "PRODUCT" && !productId) {
      return { success: false, error: "يجب اختيار المنتج" };
    }

    const date = dateRaw ? new Date(dateRaw) : new Date();

    let reason: any = "PURCHASE";
    if (reasonRaw) {
      reason = reasonRaw;
    } else if (itemType === "MATERIAL") {
      reason = type === "IN" ? "PURCHASE" : "PRODUCTION_MATERIAL_OUT";
    } else {
      reason = type === "IN" ? "PRODUCTION_PRODUCT_IN" : "SALES";
    }

    await prisma.inventoryTransaction.create({
      data: {
        type,
        reason,
        quantity,
        date,
        notes: notes || null,
        materialId: itemType === "MATERIAL" ? materialId : null,
        productId: itemType === "PRODUCT" ? productId : null,
      },
    });

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل حركة المخزن" };
  }
}

export async function deleteInventoryTransactionAction(id: string) {
  try {
    await prisma.inventoryTransaction.delete({
      where: { id },
    });
    revalidatePath("/inventory");
    revalidatePath("/materials-stage");
    revalidatePath("/production-stage");
    revalidatePath("/sales-stage");
    revalidatePath("/statement");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory transaction:", error);
    return { success: false, error: "حدث خطأ أثناء حذف حركة المخزن" };
  }
}
