
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Expenses"
        description="Track your warehouse operational expenses."
      />
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
