
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowDown, ArrowUp, Warehouse } from "lucide-react";
import { storageRecords as getStorageRecords } from "@/lib/data";

export default async function StoragePage() {
  const allRecords = await getStorageRecords();

  const totalInflow = allRecords.reduce((acc, record) => acc + record.bagsStored, 0);

  const completedRecords = allRecords.filter(r => r.storageEndDate);
  const totalOutflow = completedRecords.reduce((acc, record) => acc + record.bagsStored, 0);

  const balanceStock = totalInflow - totalOutflow;

  return (
    <AppLayout>
      <PageHeader
        title="Storage Overview"
        description="A high-level summary of your warehouse inventory."
      >
        <Button asChild>
            <Link href="/inflow">
                <PlusCircle className="mr-2" />
                Add Inflow
            </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalInflow} bags</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalOutflow} bags</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance Stock</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{balanceStock} bags</div>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
