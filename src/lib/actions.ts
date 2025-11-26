
'use server';

import { z } from 'zod';
import { storageRecords, customers, saveCustomers, saveStorageRecords } from '@/lib/data';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { detectStorageAnomalies as detectStorageAnomaliesFlow } from '@/ai/flows/anomaly-detection';

const NewCustomerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  email: z.string().optional(),
});

export type FormState = {
  message: string;
  success: boolean;
};

export async function getAnomalyDetection() {
  try {
    const records = await storageRecords();
    const result = await detectStorageAnomaliesFlow({ storageRecords: JSON.stringify(records) });
    return { success: true, anomalies: result.anomalies };
  } catch (error) {
    return { success: false, anomalies: 'An error occurred while analyzing records.' };
  }
}

export async function addCustomer(prevState: FormState, formData: FormData) {
    const validatedFields = NewCustomerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }

    const newCustomer = {
        id: `cust_${Date.now()}`,
        ...validatedFields.data,
        email: validatedFields.data.email ?? '',
    };

    const currentCustomers = await customers();
    currentCustomers.unshift(newCustomer);
    await saveCustomers(currentCustomers);
    
    revalidateTag('customers');
    redirect('/customers');
}

const InflowSchema = z.object({
    customerId: z.string().min(1, 'Customer is required.'),
    commodityDescription: z.string().min(2, 'Commodity description is required.'),
    location: z.string().min(1, 'Location is required.'),
    storageStartDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    bagsStored: z.coerce.number().int().positive('Number of bags must be a positive number.'),
    hamaliRate: z.coerce.number().positive('Hamali rate must be a positive number.'),
    hamaliPaid: z.coerce.number().nonnegative('Hamali paid must be a non-negative number.').optional(),
});

export type InflowFormState = {
    message: string;
    success: boolean;
};

export async function addInflow(prevState: InflowFormState, formData: FormData) {
    const validatedFields = InflowSchema.safeParse({
        customerId: formData.get('customerId'),
        commodityDescription: formData.get('commodityDescription'),
        location: formData.get('location'),
        storageStartDate: formData.get('storageStartDate'),
        bagsStored: formData.get('bagsStored'),
        hamaliRate: formData.get('hamaliRate'),
        hamaliPaid: formData.get('hamaliPaid'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }

    const { bagsStored, hamaliRate, hamaliPaid, storageStartDate, ...rest } = validatedFields.data;

    const hamaliPayable = bagsStored * hamaliRate;
    const payments = [];
    if (hamaliPaid && hamaliPaid > 0) {
        payments.push({ amount: hamaliPaid, date: new Date(storageStartDate) });
    }
    
    const newRecord = {
        id: `rec_${Date.now()}`,
        ...rest,
        bagsStored,
        storageStartDate: new Date(storageStartDate),
        storageEndDate: null,
        billingCycle: '6-Month Initial' as const,
        payments: payments,
        hamaliPayable: hamaliPayable,
        totalRentBilled: 0,
    };

    const currentRecords = await storageRecords();
    currentRecords.unshift(newRecord);
    await saveStorageRecords(currentRecords);

    revalidateTag('storageRecords');
    redirect(`/inflow/receipt/${newRecord.id}`);
}

const OutflowSchema = z.object({
    recordId: z.string().min(1, 'A storage record must be selected.'),
    bagsToWithdraw: z.coerce.number().int().positive('Bags to withdraw must be a positive number.'),
    withdrawalDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    finalRent: z.coerce.number().nonnegative('Final rent cannot be negative.'),
    amountPaidNow: z.coerce.number().nonnegative('Amount paid must be non-negative.').optional(),
});

export type OutflowFormState = {
    message: string;
    success: boolean;
};

export async function addOutflow(prevState: OutflowFormState, formData: FormData) {
    const validatedFields = OutflowSchema.safeParse({
        recordId: formData.get('recordId'),
        bagsToWithdraw: formData.get('bagsToWithdraw'),
        withdrawalDate: formData.get('withdrawalDate'),
        finalRent: formData.get('finalRent'),
        amountPaidNow: formData.get('amountPaidNow'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }
    
    const currentRecords = await storageRecords();
    const { recordId, bagsToWithdraw, withdrawalDate, finalRent, amountPaidNow } = validatedFields.data;
    
    const recordIndex = currentRecords.findIndex(r => r.id === recordId);

    if (recordIndex === -1) {
        return { message: 'Record not found.', success: false };
    }

    const originalRecord = currentRecords[recordIndex];

    if (bagsToWithdraw > originalRecord.bagsStored) {
        return { message: 'Cannot withdraw more bags than are in storage.', success: false };
    }

    const isFullWithdrawal = bagsToWithdraw === originalRecord.bagsStored;
    const paymentMade = amountPaidNow || 0;

    if (!originalRecord.payments) {
      originalRecord.payments = [];
    }

    if (paymentMade > 0) {
        originalRecord.payments.push({ amount: paymentMade, date: new Date(withdrawalDate) });
    }

    if (isFullWithdrawal) {
        originalRecord.storageEndDate = new Date(withdrawalDate);
        originalRecord.billingCycle = 'Completed';
        originalRecord.totalRentBilled += finalRent;
    } else {
        // Partial withdrawal: update bag count and add rent to total billed.
        originalRecord.bagsStored -= bagsToWithdraw;
        originalRecord.totalRentBilled += finalRent;
    }
    
    currentRecords[recordIndex] = originalRecord;

    await saveStorageRecords(currentRecords);

    revalidateTag('storageRecords');
    redirect(`/outflow/receipt/${recordId}?withdrawn=${bagsToWithdraw}&rent=${finalRent}&paidNow=${paymentMade}`);
}

const StorageRecordSchema = z.object({
  customerId: z.string().min(1, 'Customer is required.'),
  commodityDescription: z.string().min(2, 'Commodity description is required.'),
  location: z.string().min(1, 'Location is required.'),
  bagsStored: z.coerce.number().int().positive('Bags must be a positive number.'),
  hamaliPayable: z.coerce.number().nonnegative('Hamali charges must be a non-negative number.'),
  storageStartDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
});


export async function updateStorageRecord(recordId: string, prevState: InflowFormState, formData: FormData) {
    const validatedFields = StorageRecordSchema.safeParse({
        customerId: formData.get('customerId'),
        commodityDescription: formData.get('commodityDescription'),
        location: formData.get('location'),
        bagsStored: formData.get('bagsStored'),
        hamaliPayable: formData.get('hamaliPayable'),
        storageStartDate: formData.get('storageStartDate'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }

    const currentRecords = await storageRecords();
    const recordIndex = currentRecords.findIndex(r => r.id === recordId);

    if (recordIndex === -1) {
        return { message: 'Record not found.', success: false };
    }

    const originalRecord = currentRecords[recordIndex];
    // Note: This simplified update doesn't allow changing payment history directly.
    // We're preserving the existing payments array.

    currentRecords[recordIndex] = {
        ...originalRecord,
        customerId: validatedFields.data.customerId,
        commodityDescription: validatedFields.data.commodityDescription,
        location: validatedFields.data.location,
        bagsStored: validatedFields.data.bagsStored,
        hamaliPayable: validatedFields.data.hamaliPayable,
        storageStartDate: new Date(validatedFields.data.storageStartDate),
    };

    await saveStorageRecords(currentRecords);

    revalidateTag('storageRecords');
    return { message: 'Record updated successfully.', success: true };
}


const PaymentSchema = z.object({
  recordId: z.string(),
  paymentAmount: z.coerce.number().positive('Payment amount must be a positive number.'),
  paymentDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
});

export type PaymentFormState = {
    message: string;
    success: boolean;
};

export async function addPayment(prevState: PaymentFormState, formData: FormData) {
    const validatedFields = PaymentSchema.safeParse({
        recordId: formData.get('recordId'),
        paymentAmount: formData.get('paymentAmount'),
        paymentDate: formData.get('paymentDate'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }
    
    const currentRecords = await storageRecords();
    const { recordId, paymentAmount, paymentDate } = validatedFields.data;
    
    const recordIndex = currentRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
        return { message: 'Record not found.', success: false };
    }
    
    const record = currentRecords[recordIndex];
    
    if (!record.payments) {
        record.payments = [];
    }

    record.payments.push({
        amount: paymentAmount,
        date: new Date(paymentDate),
    });
    
    await saveStorageRecords(currentRecords);
    
    revalidateTag('storageRecords');
    return { message: 'Payment added successfully.', success: true };
}
