'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Customer, StorageRecord } from '@/lib/definitions';
import { format } from 'date-fns';
import { RATE_6_MONTHS } from '@/lib/billing';
import { Button } from '../ui/button';
import { Printer } from 'lucide-react';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function InflowReceipt({ record, customer }: { record: StorageRecord, customer: Customer }) {
    const componentRef = useRef(null);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        // Format the date only on the client-side to avoid hydration mismatch
        setFormattedDate(format(new Date(record.storageStartDate), 'dd MMM yyyy, hh:mm a'));
    }, [record.storageStartDate]);

    const initialRent = record.bagsStored * RATE_6_MONTHS;
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div ref={componentRef} className="printable-area">
                <Card className="w-full shadow-none border-0 md:border md:shadow-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Storage Inflow Receipt</CardTitle>
                        <CardDescription>Record ID: {record.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h3 className="font-semibold mb-2">Customer Details</h3>
                                <p>{customer.name}</p>
                                <p>{customer.address}</p>
                                <p>Phone: {customer.phone}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2">Storage Details</h3>
                                <p><span className="font-medium">Date:</span> {formattedDate}</p>
                                <p><span className="font-medium">Commodity:</span> {record.commodityDescription}</p>
                                <p><span className="font-medium">Number of Bags:</span> {record.bagsStored}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold mb-2">Billing Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Hamali Charges</span>
                                    <span>{formatCurrency(record.hamaliCharges)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Initial Rent (for 6 months)</span>
                                    <span>{formatCurrency(initialRent)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total Amount Paid</span>
                                    <span>{formatCurrency(record.totalBilled)}</span>
                                </div>
                            </div>
                        </div>

                         <Separator />

                        <div className="text-xs text-muted-foreground space-y-2">
                           <p>
                                <strong>Terms & Conditions:</strong>
                                This receipt confirms the storage of the above-mentioned goods. The initial rent covers the first 6 months of storage. Subsequent rent will be charged annually at the prevailing rate.
                            </p>
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6 flex justify-center print-hide">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                </Button>
            </div>
        </div>
    );
}
