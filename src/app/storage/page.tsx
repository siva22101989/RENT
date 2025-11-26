
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageTable } from "@/components/dashboard/storage-table";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function StoragePage() {
  return (
    <AppLayout>
      <PageHeader
        title="Active Storage"
        description="An overview of all records currently in storage."
      >
        <Button asChild>
            <Link href="/inflow">
                <PlusCircle className="mr-2" />
                Add Inflow
            </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <StorageTable />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
