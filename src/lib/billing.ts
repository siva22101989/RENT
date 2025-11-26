
import { differenceInCalendarMonths, addMonths, isAfter, startOfDay, differenceInDays } from 'date-fns';
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

  // After 1 year, it's always in a 1-year renewal cycle
  if (monthsStored >= 12) {
    const yearsStored = Math.floor(monthsStored / 12);
    const nextBillingDate = addMonths(startDate, (yearsStored + 1) * 12);
    const status = `In 1-Year Renewal (Y${yearsStored + 1})`;

    if (isAfter(today, nextBillingDate) || today.getTime() === nextBillingDate.getTime()) {
      alert = `Renewal for Year ${yearsStored + 2} is due.`;
    }

    return { status, nextBillingDate, currentRate: RATE_1_YEAR, alert };
  }

  // Between 6 and 11 months, it's in the 1-year rollover period
  if (monthsStored >= 6) {
    const nextBillingDate = addMonths(startDate, 12);
    const status = 'Active - 1-Year Rollover';

    const rolloverDate = addMonths(startDate, 6);
    if ((isAfter(today, rolloverDate) || today.getTime() === rolloverDate.getTime()) && record.billingCycle === '6-Month Initial') {
      alert = `1-Year Rollover top-up is due.`;
    }

    return { status, nextBillingDate, currentRate: RATE_1_YEAR, alert };
  }

  // Between 0 and 5 months, it's in the initial 6-month term
  const nextBillingDate = addMonths(startDate, 6);
  const status = 'Active - 6-Month Term';
  return { status, nextBillingDate, currentRate: RATE_6_MONTHS, alert };
}


export function calculateFinalRent(record: StorageRecord, withdrawalDate: Date, bagsToWithdraw: number): { rent: number } {
  const today = startOfDay(withdrawalDate);
  const startDate = record.storageStartDate;
  
  // Calculate months stored at the time of withdrawal
  const monthsStored = differenceInCalendarMonths(today, startDate);

  let rentDue = 0;

  // Case 1: Withdrawal within the initial 6-month period, but after the 6-month mark passes.
  // This triggers a rollover to the 1-year rate.
  if (monthsStored >= 6 && monthsStored < 12 && record.billingCycle === '6-Month Initial') {
      // The user has already paid for 6 months, so they owe the difference for the 1-year rate.
      rentDue = (RATE_1_YEAR - RATE_6_MONTHS) * bagsToWithdraw;
  }
  // Case 2: Withdrawal after a 12-month period has passed.
  // This triggers a renewal for another year.
  else if (monthsStored >= 12) {
      const yearsStored = Math.floor(monthsStored / 12);
      const renewalDate = addMonths(startDate, yearsStored * 12);

      // If the withdrawal happens on or after the renewal date for the next year, a new year's rent is due.
      if (isAfter(today, renewalDate) || today.getTime() === renewalDate.getTime()) {
          rentDue = RATE_1_YEAR * bagsToWithdraw;
      }
  }

  // If no specific condition is met, it means withdrawal is happening within a pre-paid period
  // (e.g., within the first 5 months of the 6-month term, or within a paid year).
  // In those cases, no *additional* rent is due for the withdrawal itself.
  return { rent: rentDue > 0 ? rentDue : 0 };
}
