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
