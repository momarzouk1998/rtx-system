import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditProductionForm } from "./EditProductionForm";

export const dynamic = "force-dynamic";

export default async function EditProductionPage({ params }: { params: { id: string } }) {
  const order = await prisma.productionOrder.findUnique({
    where: { id: params.id },
    include: {
      product: {
        include: { material: true }
      },
      factory: true,
    },
  });

  const factories = await prisma.factory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, bagsPerKg: true, operatingCost: true, material: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/production-stage" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة أوامر التصنيع
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل أمر التصنيع</h1>
        
        <EditProductionForm 
          order={order}
          factories={factories}
          products={products}
        />
      </div>
    </div>
  );
}
