import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";

export default function ReportsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Reports"
        description="View and generate reports."
      />
      <div>
        <p>Reports content goes here.</p>
      </div>
    </AppLayout>
  );
}
