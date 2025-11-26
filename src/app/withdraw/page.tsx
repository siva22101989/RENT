import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/shared/page-header";
import { WithdrawGoodsForm } from "@/components/storage/withdraw-goods-form";
import { storageRecords, customers } from "@/lib/data";

export default function WithdrawPage() {
  const activeRecords = storageRecords.filter(r => !r.storageEndDate);
  return (
    <AppLayout>
      <PageHeader
        title="Add Outflow"
        description="Mark a storage record as completed and generate the final bill."
      />
      <WithdrawGoodsForm records={activeRecords} customers={customers} />
    </AppLayout>
  );
}
