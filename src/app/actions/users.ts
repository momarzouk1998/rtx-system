'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function createUser(data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const password = data.get("password") as string;
    const role = data.get("role") as UserRole;
    const job = data.get("job") as string;
    const email = data.get("email") as string;

    if (!name || !phone || !password) {
      return { success: false, error: "الاسم ورقم الهاتف وكلمة المرور مطلوبون" };
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { name }]
      }
    });

    if (exists) {
      return { success: false, error: "اسم المستخدم أو رقم الهاتف موجود مسبقاً" };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: role || 'USER',
        job: job || null,
        email: email || null,
      },
    });

    revalidatePath("/users-list");
    return { success: true };
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء إضافة المستخدم" };
  }
}

export async function updateUserAdmin(id: string, data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const password = data.get("password") as string;
    const role = data.get("role") as UserRole;
    const job = data.get("job") as string;
    const email = data.get("email") as string;

    if (!name || !phone) {
      return { success: false, error: "الاسم ورقم الهاتف مطلوبون" };
    }

    const exists = await prisma.user.findFirst({
      where: {
        AND: [
          { OR: [{ phone }, { name }] },
          { id: { not: id } }
        ]
      }
    });

    if (exists) {
      return { success: false, error: "اسم المستخدم أو رقم الهاتف موجود مسبقاً" };
    }

    const updateData: any = {
      name,
      phone,
      role: role || 'USER',
      job: job || null,
      email: email || null,
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/users-list");
    return { success: true };
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء تعديل المستخدم" };
  }
}

export async function updateProfile(data: FormData) {
  const id = data.get("id") as string;
  return updateUserAdmin(id, data);
}

export async function deleteUser(id: string) {
  try {
    const userCount = await prisma.user.count();
    if (userCount <= 1) {
       return { success: false, error: "لا يمكن حذف المستخدم الأخير" };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/users-list");
    return { success: true };
  } catch (error) {
    return { success: false, error: "لا يمكن حذف مستخدم له عمليات سابقة" };
  }
}
