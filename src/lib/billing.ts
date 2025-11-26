
import { differenceInCalendarMonths, addMonths, isAfter, startOfDay, differenceInYears, addYears } from 'date-fns';
import type { StorageRecord } from '@/lib/definitions';

// Rates
export const RATE_6_MONTHS = 36;
export const RATE_1_YEAR = 55;

export type RecordStatusInfo = {
  status: string;
  nextBillingDate: Date | null;
  currentRate: number;
  alert: string | null;
};

export function getRecordStatus(record: StorageRecord): RecordStatusInfo {
  const today = startOfDay(new Date());
  const startDate = record.storageStartDate;
  
  if (record.storageEndDate) {
    return {
      status: `Withdrawn`,
      nextBillingDate: null,
      currentRate: 0,
      alert: null,
    };
  }
  
  const monthsStored = differenceInCalendarMonths(today, startDate);

  let alert: string | null = null;
  let status: string;
  let nextBillingDate: Date | null;
  let currentRate: number;

  const initial6MonthDate = addMonths(startDate, 6);
  const initial12MonthDate = addMonths(startDate, 12);

  // Before 6 months
  if (isAfter(initial6MonthDate, today)) {
    status = 'Active - 6-Month Term';
    nextBillingDate = initial6MonthDate;
    currentRate = RATE_6_MONTHS;
  } 
  // Between 6 and 12 months
  else if (isAfter(initial12MonthDate, today)) {
    status = 'Active - 1-Year Rollover';
    nextBillingDate = initial12MonthDate;
    currentRate = RATE_1_YEAR;
    if (record.billingCycle === '6-Month Initial') {
        alert = `1-Year Rollover top-up is due.`;
    }
  } 
  // After 12 months
  else {
    const yearsStored = Math.floor(monthsStored / 12);
    const renewalYears = yearsStored + 1;
    nextBillingDate = addMonths(startDate, renewalYears * 12);
    status = `In 1-Year Renewal (Y${renewalYears})`;
    currentRate = RATE_1_YEAR;
    
    // Check if the current date is past the last paid renewal date
    const lastRenewalDate = addMonths(startDate, yearsStored * 12);
    if (!isAfter(lastRenewalDate, today)) {
      alert = `Renewal for Year ${renewalYears + 1} is due.`;
    }
  }

  return { status, nextBillingDate, currentRate, alert };
}

export function calculateFinalRent(record: StorageRecord, withdrawalDate: Date, bagsToWithdraw: number): { rent: number } {
  const startDate = startOfDay(record.storageStartDate);
  const endDate = startOfDay(withdrawalDate);
  const monthsStored = differenceInCalendarMonths(endDate, startDate);

  // Initial rent for 6 months is already part of the record's `totalBilled` on inflow.
  const rentAlreadyPaid = RATE_6_MONTHS * (record.hamaliCharges > 0 ? (record.totalBilled - record.hamaliCharges) / RATE_6_MONTHS : record.bagsStored);
  
  let totalRentOwed = 0;

  if (monthsStored < 6) {
    // Withdrawing within the first 6 months. Rent is already covered.
    totalRentOwed = rentAlreadyPaid;
  } else if (monthsStored >= 6 && monthsStored < 12) {
    // Withdrawing between 6 and 12 months. Owe the full year rate.
    totalRentOwed = RATE_1_YEAR * record.bagsStored;
  } else { // monthsStored >= 12
    // Withdrawing after one or more years.
    const yearsStored = Math.floor(monthsStored / 12);
    // Base rent is the first year's rate.
    totalRentOwed = RATE_1_YEAR * record.bagsStored;
    // Add rent for subsequent full years.
    if (yearsStored > 1) {
      totalRentOwed += (RATE_1_YEAR * record.bagsStored * (yearsStored - 1));
    }
  }

  // Calculate rent proportion for bags being withdrawn
  const rentPerBagOwed = totalRentOwed / record.bagsStored;
  const rentAlreadyPaidPerBag = rentAlreadyPaid / record.bagsStored;
  
  const additionalRentForWithdrawnBags = (rentPerBagOwed - rentAlreadyPaidPerBag) * bagsToWithdraw;
  
  // Ensure we don't have negative rent
  return { rent: Math.max(0, additionalRentForWithdrawnBags) };
}
