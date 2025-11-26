
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { InflowForm } from "@/components/inflow/inflow-form";
import { customers } from "@/lib/data";

export default function InflowPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Add Inflow"
        description="Create a new storage record for a customer."
      />
      <InflowForm customers={customers} />
    </AppLayout>
  );
}
