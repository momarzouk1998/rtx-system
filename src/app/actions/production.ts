'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProductionOrder(data: FormData) {
  try {
    const category = data.get("category") as "INTERNAL" | "EXTERNAL";
    const factoryId = data.get("factoryId") as string;
    const productId = data.get("productId") as string;
    const quantityKgRaw = parseFloat(data.get("quantityKg") as string);
    const quantityKg = isNaN(quantityKgRaw) || quantityKgRaw < 0 ? 0 : quantityKgRaw;
    const receivedQuantityKgRaw = parseFloat(data.get("receivedQuantityKg") as string);
    const receivedQuantityKg = isNaN(receivedQuantityKgRaw) || receivedQuantityKgRaw < 0 ? 0 : receivedQuantityKgRaw;
    const notes = data.get("notes") as string;
    const dateRaw = data.get("date") as string;
    // سعر التصنيع — يأتي من النموذج (قابل للتعديل) وإن لم يوجد يستخدم الافتراضي من المنتج
    const customOperatingCostRaw = data.get("operatingCost") as string;

    if (!productId || (quantityKg <= 0 && receivedQuantityKg <= 0)) {
      return { success: false, error: "يجب إدخال كمية مواد مسلّمة أو كمية منتج مستلَم على الأقل" };
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
    const packagedBags = Math.round(receivedQuantityKg * product.bagsPerKg);
    const perKgCost = (customOperatingCostRaw && !isNaN(parseFloat(customOperatingCostRaw)))
      ? parseFloat(customOperatingCostRaw)
      : product.operatingCost;
    const totalOperatingCost = category === "EXTERNAL" ? receivedQuantityKg * perKgCost : 0;
    // التاريخ اللي دخله المستخدم، أو اليوم لو فاضي
    const date = dateRaw ? new Date(dateRaw) : new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Create Production Order
      const order = await tx.productionOrder.create({
        data: {
          category,
          date,
          factoryId: category === "EXTERNAL" ? factoryId : null,
          productId,
          materialId: product.materialId,
          quantityKg,
          receivedQuantityKg,
          operatingCost: category === "EXTERNAL" ? perKgCost : 0,
          totalOperatingCost,
          packagedBags,
          bagsPerKg: product.bagsPerKg,
          notes: notes || null,
        },
      });

      // 2. Material Out Transaction (if materials delivered)
      if (quantityKg > 0) {
        await tx.inventoryTransaction.create({
          data: {
            type: "OUT",
            reason: "PRODUCTION_MATERIAL_OUT",
            quantity: quantityKg,
            materialId: product.materialId,
            referenceId: order.id,
          }
        });
      }

      // 3. Product In Transaction (Ready Bags if finished product received)
      if (packagedBags > 0) {
        await tx.inventoryTransaction.create({
          data: {
            type: "IN",
            reason: "PRODUCTION_PRODUCT_IN",
            quantity: packagedBags,
            productId: product.id,
            referenceId: order.id,
          }
        });
      }
    });

    revalidatePath("/production-stage");
    return { success: true };
  } catch (error) {
    console.error("Error creating production order:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة أمر التصنيع" };
  }
}

export async function updateProductionOrder(id: string, data: FormData) {
  try {
    const category = data.get("category") as "INTERNAL" | "EXTERNAL";
    const factoryId = data.get("factoryId") as string;
    const productId = data.get("productId") as string;
    const quantityKgRaw = parseFloat(data.get("quantityKg") as string);
    const quantityKg = isNaN(quantityKgRaw) || quantityKgRaw < 0 ? 0 : quantityKgRaw;
    const receivedQuantityKgRaw = parseFloat(data.get("receivedQuantityKg") as string);
    const receivedQuantityKg = isNaN(receivedQuantityKgRaw) || receivedQuantityKgRaw < 0 ? 0 : receivedQuantityKgRaw;
    const notes = data.get("notes") as string;
    const dateRaw = data.get("date") as string;
    const customOperatingCostRaw = data.get("operatingCost") as string;

    if (!productId || (quantityKg <= 0 && receivedQuantityKg <= 0)) {
      return { success: false, error: "يجب إدخال كمية مواد مسلّمة أو كمية منتج مستلَم على الأقل" };
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
    const packagedBags = Math.round(receivedQuantityKg * product.bagsPerKg);
    const perKgCost = (customOperatingCostRaw && !isNaN(parseFloat(customOperatingCostRaw)))
      ? parseFloat(customOperatingCostRaw)
      : product.operatingCost;
    const totalOperatingCost = category === "EXTERNAL" ? receivedQuantityKg * perKgCost : 0;
    // التاريخ اللي دخله المستخدم، أو اليوم لو فاضي
    const date = dateRaw ? new Date(dateRaw) : new Date();

    // Delete existing inventory transactions for this order
    await prisma.inventoryTransaction.deleteMany({
      where: { referenceId: id }
    });

    await prisma.$transaction(async (tx) => {
      // 1. Update Production Order
      const order = await tx.productionOrder.update({
        where: { id },
        data: {
          category,
          date,
          factoryId: category === "EXTERNAL" ? factoryId : null,
          productId,
          materialId: product.materialId,
          quantityKg,
          receivedQuantityKg,
          operatingCost: category === "EXTERNAL" ? perKgCost : 0,
          totalOperatingCost,
          packagedBags,
          bagsPerKg: product.bagsPerKg,
          notes: notes || null,
        },
      });

      // 2. Material Out Transaction (if materials delivered)
      if (quantityKg > 0) {
        await tx.inventoryTransaction.create({
          data: {
            type: "OUT",
            reason: "PRODUCTION_MATERIAL_OUT",
            quantity: quantityKg,
            materialId: product.materialId,
            referenceId: order.id,
          }
        });
      }

      // 3. Product In Transaction (Ready Bags if finished product received)
      if (packagedBags > 0) {
        await tx.inventoryTransaction.create({
          data: {
            type: "IN",
            reason: "PRODUCTION_PRODUCT_IN",
            quantity: packagedBags,
            productId: product.id,
            referenceId: order.id,
          }
        });
      }
    });

    revalidatePath("/production-stage");
    return { success: true };
  } catch (error) {
    console.error("Error updating production order:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل أمر التصنيع" };
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
