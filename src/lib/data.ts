
'use server';

import type { Customer, StorageRecord, Payment } from '@/lib/definitions';
import fs from 'fs/promises';
import path from 'path';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

// Data file paths
const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const customersPath = path.join(dataDir, 'customers.json');
const storageRecordsPath = path.join(dataDir, 'storageRecords.json');

// Helper function to read JSON file
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Date strings need to be converted back to Date objects
    if (filePath === storageRecordsPath) {
        return (data as any[]).map(record => ({
            ...record,
            storageStartDate: record.storageStartDate ? new Date(record.storageStartDate) : new Date(),
            storageEndDate: record.storageEndDate ? new Date(record.storageEndDate) : null,
            // Migrate old 'amountPaid' to new 'payments' array and ensure it always exists
            payments: record.payments 
              ? record.payments.map((p: any) => ({ ...p, date: new Date(p.date) })) 
              : (record.amountPaid ? [{ amount: record.amountPaid, date: new Date(record.storageStartDate) }] : []),
            amountPaid: undefined, // remove old field
        })) as T[];
    }
    return data as T[];
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await writeJsonFile(filePath, []);
      return [];
    }
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Helper function to write JSON file
async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    // When writing, ensure payments array is correctly formatted
    const dataToWrite = filePath === storageRecordsPath
        ? (data as StorageRecord[]).map(record => {
            const { ...rest } = record;
            // The 'amountPaid' property is deprecated and should not be saved.
            // It was a virtual property during migration.
            return rest;
          })
        : data;

    await fs.writeFile(filePath, JSON.stringify(dataToWrite, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}


// Cached data access functions
export const customers = cache(
  async () => readJsonFile<Customer>(customersPath), 
  ['customers'], 
  { tags: ['customers'] }
);
export const storageRecords = cache(
  async () => readJsonFile<StorageRecord>(storageRecordsPath), 
  ['storageRecords'], 
  { tags: ['storageRecords'] }
);

// Data mutation functions
export const saveCustomers = async (data: Customer[]): Promise<void> => {
  await writeJsonFile(customersPath, data);
  revalidateTag('customers');
};

export const saveStorageRecords = async (data: StorageRecord[]): Promise<void> => {
  await writeJsonFile(storageRecordsPath, data);
  revalidateTag('storageRecords');
};
