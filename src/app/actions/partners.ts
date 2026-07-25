'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const address = data.get("address") as string;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;

    if (!name) {
      return { success: false, error: "اسم المورد مطلوب" };
    }

    await prisma.supplier.create({
      data: {
        name,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        openingBalance,
      },
    });

    revalidatePath("/suppliers-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المورد" };
  }
}

export async function createFactory(data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const address = data.get("address") as string;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;

    if (!name) {
      return { success: false, error: "اسم المصنع مطلوب" };
    }

    await prisma.factory.create({
      data: {
        name,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        openingBalance,
      },
    });

    revalidatePath("/factories-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating factory:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المصنع" };
  }
}
