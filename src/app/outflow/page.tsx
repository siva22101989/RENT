
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { OutflowForm } from "@/components/outflow/outflow-form";
import { storageRecords, customers } from "@/lib/data";

export default function OutflowPage() {
  const activeRecords = storageRecords.filter(r => !r.storageEndDate);
  return (
    <AppLayout>
      <PageHeader
        title="Process Outflow"
        description="Withdraw a storage record and finalize billing."
      />
      <OutflowForm records={activeRecords} customers={customers}/>
    </AppLayout>
  );
}
