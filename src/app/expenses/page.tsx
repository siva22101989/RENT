
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function ExpensesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Expenses"
        description="Track your warehouse operational expenses."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Expense
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The expense tracking feature is currently under development. Please check back later!</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
