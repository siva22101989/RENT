
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { storageRecords as getStorageRecords, customers as getCustomers } from "@/lib/data";
import { ReportClient } from "@/components/reports/report-client";

export default async function ReportsPage() {
    const allRecords = await getStorageRecords();
    const allCustomers = await getCustomers();
    
  return (
    <AppLayout>
      <PageHeader
        title="All Transactions Report"
        description="A complete log of all storage records, filterable by customer."
      />
      <ReportClient records={allRecords} customers={allCustomers} />
    </AppLayout>
  );
}
