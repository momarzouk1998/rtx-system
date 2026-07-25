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
