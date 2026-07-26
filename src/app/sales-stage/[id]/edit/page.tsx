import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { updateSalesInvoice } from "../../../actions/sales";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditInvoiceForm } from "./EditInvoiceForm";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await prisma.salesInvoice.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      items: true,
    },
  });

  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, bagPrice: true },
    orderBy: { name: "asc" },
  });

  if (!invoice) {
    notFound();
  }

  const initialItems = invoice.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  return (
    <div className="space-y-4">
      <Link href="/sales-stage" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#12829b]">
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة الفواتير
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-800 mb-6">تعديل الفاتورة #{invoice.orderNumber}</h1>
        
        <EditInvoiceForm 
          invoice={invoice}
          clients={clients}
          products={products}
          initialItems={initialItems}
        />
      </div>
    </div>
  );
}
