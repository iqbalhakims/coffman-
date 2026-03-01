import { AppShell } from "@/components/AppShell";
import SaleForm from "@/components/sales/SaleForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewSalePage() {
  return (
    <AppShell>
      <div className="p-6 space-y-4 h-full flex flex-col">
        <div>
          <Link
            href="/sales"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Sales
          </Link>
          <h1 className="text-2xl font-bold mt-2">New Sale</h1>
        </div>
        <div className="flex-1">
          <SaleForm />
        </div>
      </div>
    </AppShell>
  );
}
