'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(data: FormData) {
  try {
    const name = data.get("name") as string;
    const materialId = data.get("materialId") as string;
    const bagPrice = parseFloat(data.get("bagPrice") as string) || 0;
    const operatingCost = parseFloat(data.get("operatingCost") as string) || 0;
    const bagsPerKg = parseFloat(data.get("bagsPerKg") as string) || 1;
    const profitPerBag = parseFloat(data.get("profitPerBag") as string) || 0;
    const openingBalanceKg = parseFloat(data.get("openingBalanceKg") as string) || 0;
    const openingBalanceBags = parseFloat(data.get("openingBalanceBags") as string) || 0;
    const notes = data.get("notes") as string;

    if (!name || !materialId) {
      return { success: false, error: "الاسم والخامة مطلوبة" };
    }

    await prisma.product.create({
      data: {
        name,
        materialId,
        bagPrice,
        operatingCost,
        bagsPerKg,
        profitPerBag,
        openingBalanceKg,
        openingBalanceBags,
        notes: notes || null,
      },
    });

    revalidatePath("/products-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المنتج" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Check if product has production orders
    const productionOrdersCount = await prisma.productionOrder.count({
      where: { productId: id },
    });

    if (productionOrdersCount > 0) {
      return { success: false, error: `لا يمكن حذف المنتج لأنه لديه ${productionOrdersCount} أمر إنتاج. يجب حذف أوامر الإنتاج أولاً.` };
    }

    // Check if product has packaging orders
    const packagingOrdersCount = await prisma.packagingOrder.count({
      where: { productId: id },
    });

    if (packagingOrdersCount > 0) {
      return { success: false, error: `لا يمكن حذف المنتج لأنه لديه ${packagingOrdersCount} أمر تغليف. يجب حذف أوامر التغليف أولاً.` };
    }

    // Check if product has order items (in invoices)
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      return { success: false, error: `لا يمكن حذف المنتج لأنه موجود في ${orderItemsCount} فاتورة. يجب حذف الفواتير أولاً.` };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المنتج" };
  }
}
