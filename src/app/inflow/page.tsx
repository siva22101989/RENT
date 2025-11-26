import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { InflowForm } from "@/components/inflow/inflow-form";
import { customers } from "@/lib/data";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";

export default function InflowPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Add Inflow"
        description="Create a new storage record for a customer."
      >
        <AddCustomerDialog />
      </PageHeader>
      <InflowForm customers={customers} />
    </AppLayout>
  );
}
