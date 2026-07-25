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
