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

export async function updateSupplier(id: string, data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const address = data.get("address") as string;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;

    if (!name) {
      return { success: false, error: "اسم المورد مطلوب" };
    }

    await prisma.supplier.update({
      where: { id },
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
    console.error("Error updating supplier:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المورد" };
  }
}

export async function updateFactory(id: string, data: FormData) {
  try {
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const whatsapp = data.get("whatsapp") as string;
    const address = data.get("address") as string;
    const openingBalance = parseFloat(data.get("openingBalance") as string) || 0;

    if (!name) {
      return { success: false, error: "اسم المصنع مطلوب" };
    }

    await prisma.factory.update({
      where: { id },
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
    console.error("Error updating factory:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المصنع" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    // Check if supplier has add materials
    const addMaterialsCount = await prisma.addMaterial.count({
      where: { supplierId: id },
    });

    if (addMaterialsCount > 0) {
      return { success: false, error: `لا يمكن حذف المورد لأنه لديه ${addMaterialsCount} عملية شراء خامات. يجب حذف العمليات أولاً.` };
    }

    // Check if supplier has expenses
    const expensesCount = await prisma.expense.count({
      where: { supplierId: id },
    });

    if (expensesCount > 0) {
      return { success: false, error: `لا يمكن حذف المورد لأنه لديه ${expensesCount} مصروف. يجب حذف المصروفات أولاً.` };
    }

    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/suppliers-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المورد" };
  }
}

export async function deleteFactory(id: string) {
  try {
    // Check if factory has production orders
    const productionOrdersCount = await prisma.productionOrder.count({
      where: { factoryId: id },
    });

    if (productionOrdersCount > 0) {
      return { success: false, error: `لا يمكن حذف المصنع لأنه لديه ${productionOrdersCount} أمر إنتاج. يجب حذف أوامر الإنتاج أولاً.` };
    }

    // Check if factory has expenses
    const expensesCount = await prisma.expense.count({
      where: { factoryId: id },
    });

    if (expensesCount > 0) {
      return { success: false, error: `لا يمكن حذف المصنع لأنه لديه ${expensesCount} مصروف. يجب حذف المصروفات أولاً.` };
    }

    await prisma.factory.delete({
      where: { id },
    });

    revalidatePath("/factories-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting factory:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المصنع" };
  }
}
