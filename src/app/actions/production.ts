'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProductionOrder(data: FormData) {
  try {
    const category = data.get("category") as "INTERNAL" | "EXTERNAL";
    const factoryId = data.get("factoryId") as string;
    const productId = data.get("productId") as string;
    const quantityKg = parseFloat(data.get("quantityKg") as string);
    const notes = data.get("notes") as string;

    if (!productId || isNaN(quantityKg) || quantityKg <= 0) {
      return { success: false, error: "بيانات غير صحيحة" };
    }

    if (category === "EXTERNAL" && !factoryId) {
      return { success: false, error: "يجب اختيار المصنع للتشغيل الخارجي" };
    }

    // Get product and its material
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { material: true }
    });

    if (!product) {
      return { success: false, error: "المنتج غير موجود" };
    }

    // Calculations based on AppSheet logic
    const packagedBags = Math.round(quantityKg * product.bagsPerKg);
    const totalOperatingCost = category === "EXTERNAL" ? quantityKg * product.operatingCost : 0;

    await prisma.$transaction(async (tx) => {
      // 1. Create Production Order
      const order = await tx.productionOrder.create({
        data: {
          category,
          factoryId: category === "EXTERNAL" ? factoryId : null,
          productId,
          materialId: product.materialId,
          quantityKg,
          operatingCost: category === "EXTERNAL" ? product.operatingCost : 0,
          totalOperatingCost,
          packagedBags,
          bagsPerKg: product.bagsPerKg,
          notes: notes || null,
        },
      });

      // 2. Material Out Transaction
      await tx.inventoryTransaction.create({
        data: {
          type: "OUT",
          reason: "PRODUCTION_MATERIAL_OUT",
          quantity: quantityKg,
          materialId: product.materialId,
          referenceId: order.id,
        }
      });

      // 3. Product In Transaction (Ready Bags)
      await tx.inventoryTransaction.create({
        data: {
          type: "IN",
          reason: "PRODUCTION_PRODUCT_IN",
          quantity: packagedBags,
          productId: product.id,
          referenceId: order.id,
        }
      });
    });

    revalidatePath("/production-stage");
    return { success: true };
  } catch (error) {
    console.error("Error creating production order:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة أمر التصنيع" };
  }
}

export async function deleteProductionOrder(id: string) {
  try {
    // Check if production order has inventory transactions
    const transactionsCount = await prisma.inventoryTransaction.count({
      where: { referenceId: id },
    });

    if (transactionsCount > 0) {
      return { success: false, error: `لا يمكن حذف أمر التصنيع لأنه لديه ${transactionsCount} حركة مخزون. يجب حذف الحركات أولاً.` };
    }

    await prisma.productionOrder.delete({
      where: { id },
    });

    revalidatePath("/production-stage");
    return { success: true };
  } catch (error) {
    console.error("Error deleting production order:", error);
    return { success: false, error: "حدث خطأ أثناء حذف أمر التصنيع" };
  }
}
