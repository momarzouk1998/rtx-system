'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// إنشاء مستخدم جديد
export async function createUser(data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const email = data.get("email") as string;
    const job = data.get("job") as string;
    const role = (data.get("role") as string) || "USER";

    if (!name) {
      return { success: false, error: "اسم المستخدم مطلوب" };
    }
    if (!phone) {
      return { success: false, error: "رقم الهاتف مطلوب" };
    }

    await prisma.user.create({
      data: {
        name,
        phone,
        whatsapp: whatsapp || null,
        email: email || null,
        job: job || null,
        role: role === "MANAGER" ? "MANAGER" : "USER",
      },
    });

    revalidatePath("/users-list");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    // الاسم/الهاتف unique — غالباً ده سبب التكرار
    return { success: false, error: "الاسم أو رقم الهاتف مستخدم بالفعل" };
  }
}

// تحديث بيانات المستخدم (للصفحة الشخصية)
export async function updateUser(data: FormData) {
  try {
    const id = data.get("id") as string;
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const email = data.get("email") as string;
    const job = data.get("job") as string;

    if (!id) {
      return { success: false, error: "معرّف المستخدم مطلوب" };
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        whatsapp: whatsapp || null,
        email: email || null,
        job: job || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/users-list");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث البيانات" };
  }
}
