
'use server';

import { z } from 'zod';
import { storageRecords, customers, RATE_6_MONTHS } from '@/lib/data';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { detectStorageAnomalies as detectStorageAnomaliesFlow } from '@/ai/flows/anomaly-detection';

const NewCustomerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
});

export type FormState = {
  message: string;
  success: boolean;
};

export async function getAnomalyDetection() {
  try {
    const result = await detectStorageAnomaliesFlow({ storageRecords: JSON.stringify(storageRecords) });
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
    };

    customers.unshift(newCustomer);
    
    revalidatePath('/customers');
    revalidatePath('/inflow');
    redirect('/customers');
}

const InflowSchema = z.object({
    customerId: z.string().min(1, 'Customer is required.'),
    commodityDescription: z.string().min(2, 'Commodity description is required.'),
    bagsStored: z.coerce.number().int().positive('Number of bags must be a positive number.'),
    hamaliRate: z.coerce.number().positive('Hamali rate must be a positive number.'),
});

export type InflowFormState = {
    message: string;
    success: boolean;
};

export async function addInflow(prevState: InflowFormState, formData: FormData) {
    const validatedFields = InflowSchema.safeParse({
        customerId: formData.get('customerId'),
        commodityDescription: formData.get('commodityDescription'),
        bagsStored: formData.get('bagsStored'),
        hamaliRate: formData.get('hamaliRate'),
    });

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors;
        const message = Object.values(error).flat().join(', ');
        return { message: `Invalid data: ${message}`, success: false };
    }

    const { bagsStored, hamaliRate } = validatedFields.data;

    const hamaliCharges = bagsStored * hamaliRate;
    const initialRent = bagsStored * RATE_6_MONTHS;
    const totalBilled = hamaliCharges + initialRent;
    
    const newRecord = {
        id: `rec_${Date.now()}`,
        ...validatedFields.data,
        storageStartDate: new Date(),
        storageEndDate: null,
        billingCycle: '6-Month Initial' as const,
        totalBilled,
        hamaliCharges,
    };

    storageRecords.unshift(newRecord);

    revalidatePath('/');
    revalidatePath('/billing');
    redirect('/');
}
