'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const address = data.get("address") as string;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;

    if (!name) {
      return { success: false, error: "اسم العميل مطلوب" };
    }

    await prisma.client.create({
      data: {
        name,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        openingBalance,
      },
    });

    revalidatePath("/clients-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة العميل" };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: "حدث خطأ أثناء حذف العميل" };
  }
}
