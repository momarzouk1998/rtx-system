'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaterial(data: FormData) {
  try {
    const name = data.get("name") as string;
    const price = parseFloat(data.get("price") as string) || 0;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;
    const notes = data.get("notes") as string;

    if (!name) {
      return { success: false, error: "اسم الخامة مطلوب" };
    }

    await prisma.material.create({
      data: {
        name,
        price,
        openingBalance,
        notes: notes || null,
      },
    });

    revalidatePath("/materials-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating material:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة الخامة" };
  }
}

export async function updateMaterial(id: string, data: FormData) {
  try {
    const name = data.get("name") as string;
    const price = parseFloat(data.get("price") as string) || 0;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;
    const notes = data.get("notes") as string;

    if (!name) {
      return { success: false, error: "اسم الخامة مطلوب" };
    }

    await prisma.material.update({
      where: { id },
      data: {
        name,
        price,
        openingBalance,
        notes: notes || null,
      },
    });

    revalidatePath("/materials-list");
    return { success: true };
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل الخامة" };
  }
}

export async function deleteMaterial(id: string) {
  try {
    // Check if material has products
    const productsCount = await prisma.product.count({
      where: { materialId: id },
    });

    if (productsCount > 0) {
      return { success: false, error: `لا يمكن حذف الخامة لأنها مرتبطة بـ ${productsCount} منتج. يجب حذف المنتجات أولاً.` };
    }

    // Check if material has add materials
    const addMaterialsCount = await prisma.addMaterial.count({
      where: { materialId: id },
    });

    if (addMaterialsCount > 0) {
      return { success: false, error: `لا يمكن حذف الخامة لأنها لديها ${addMaterialsCount} عملية شراء. يجب حذف العمليات أولاً.` };
    }

    // Check if material has production orders
    const productionOrdersCount = await prisma.productionOrder.count({
      where: { materialId: id },
    });

    if (productionOrdersCount > 0) {
      return { success: false, error: `لا يمكن حذف الخامة لأنها مستخدمة في ${productionOrdersCount} أمر إنتاج. يجب حذف أوامر الإنتاج أولاً.` };
    }

    await prisma.material.delete({
      where: { id },
    });

    revalidatePath("/materials-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الخامة" };
  }
}

export async function createAddMaterial(data: FormData) {
  try {
    const dateStr = data.get("date") as string;
    const supplierId = data.get("supplierId") as string;
    const materialId = data.get("materialId") as string;
    const quantityKg = parseFloat(data.get("quantityKg") as string) || 0;
    const unitPrice = parseFloat(data.get("unitPrice") as string) || 0;

    if (!supplierId || !materialId || quantityKg <= 0 || unitPrice <= 0) {
      return { success: false, error: "جميع الحقول مطلوبة ويجب أن تكون القيم صحيحة" };
    }

    const totalCost = quantityKg * unitPrice;

    await prisma.addMaterial.create({
      data: {
        date: dateStr ? new Date(dateStr) : new Date(),
        supplierId,
        materialId,
        quantityKg,
        unitPrice,
        totalCost,
      },
    });

    revalidatePath("/materials-stage");
    revalidatePath("/statement");
    return { success: true };
  } catch (error) {
    console.error("Error adding material:", error);
    return { success: false, error: "حدث خطأ أثناء توريد الخامة" };
  }
}

export async function deleteMaterialTransaction(id: string) {
  try {
    await prisma.addMaterial.delete({
      where: { id },
    });
    revalidatePath("/materials-stage");
    revalidatePath("/statement");
    return { success: true };
  } catch (error) {
    console.error("Error deleting material transaction:", error);
    return { success: false, error: "حدث خطأ أثناء حذف عملية التوريد" };
  }
}
