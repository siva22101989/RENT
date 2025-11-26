import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CustomersPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Customers"
        description="Manage your customers."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Add Customer
        </Button>
      </PageHeader>
      <div>
        <p>Customer management content goes here.</p>
      </div>
    </AppLayout>
  );
}
