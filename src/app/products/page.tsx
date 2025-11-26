import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProductsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Products"
        description="Manage your products."
      >
        <Button>
            <PlusCircle className="mr-2" />
            Add Product
        </Button>
      </PageHeader>
      <div>
        <p>Product management content goes here.</p>
      </div>
    </AppLayout>
  );
}
