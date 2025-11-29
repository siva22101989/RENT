
'use client';

import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Customer, StorageRecord } from '@/lib/definitions';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Download, Loader2 } from 'lucide-react';
import { formatCurrency, toDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function InflowReceipt({ record, customer }: { record: StorageRecord, customer: Customer }) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [formattedDate, setFormattedDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const amountPaid = record.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const hamaliPending = record.hamaliPayable - amountPaid;

    useEffect(() => {
        const startDate = toDate(record.storageStartDate);
        setFormattedDate(format(startDate, 'dd MMM yyyy, hh:mm a'));
    }, [record.storageStartDate]);

    const handleDownloadPdf = async () => {
        const element = receiptRef.current;
        if (!element) return;

        setIsGenerating(true);

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            let widthInPdf = pdfWidth - 20;
            let heightInPdf = widthInPdf / ratio;

            if (heightInPdf > pdfHeight - 20) {
                heightInPdf = pdfHeight - 20;
                widthInPdf = heightInPdf * ratio;
            }

            const x = (pdfWidth - widthInPdf) / 2;
            const y = 10;

            pdf.addImage(imgData, 'PNG', x, y, widthInPdf, heightInPdf);
            pdf.save(`receipt-${record.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-background p-4 sm:p-6 rounded-lg">
            <div ref={receiptRef} className="printable-area bg-white p-6 sm:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Srilakshmi Warehouse</h1>
                        <p className="text-sm text-muted-foreground">Your Company Address, City, State, ZIP</p>
                        <p className="text-sm text-muted-foreground">contact@yourwarehouse.com | (123) 456-7890</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold uppercase text-muted-foreground">Inflow Receipt</h2>
                        <p className="text-sm"><span className="font-medium">Receipt #</span>: {record.id}</p>
                        <p className="text-sm"><span className="font-medium">Date:</span> {formattedDate}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">BILL TO</h3>
                        <p className="font-medium text-lg">{customer.name}</p>
                        <p>{customer.address}</p>
                        <p>Phone: {customer.phone}</p>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">STORAGE DETAILS</h3>
                        <p><span className="font-medium">Commodity:</span> {record.commodityDescription}</p>
                        <p><span className="font-medium">Location:</span> {record.location}</p>
                        <p><span className="font-medium">Bags Stored:</span> {record.bagsStored}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70%]">Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Hamali (Loading/Unloading Charges)</TableCell>
                                <TableCell className="text-right">{formatCurrency(record.hamaliPayable)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(record.hamaliPayable)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount Paid</span>
                            <span>{formatCurrency(amountPaid)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg text-destructive">
                            <span>Balance Due (Hamali)</span>
                            <span>{formatCurrency(hamaliPending)}</span>
                        </div>
                    </div>
                </div>

                <Separator className="my-8"/>

                {/* Footer */}
                <div className="text-xs text-muted-foreground">
                    <h4 className="font-semibold mb-2">Notes & Terms</h4>
                    <p>
                        This receipt confirms the storage of goods as detailed above. Rent charges will be calculated at the time of withdrawal (outflow).
                    </p>
                    <p className="mt-4 text-center font-semibold">Thank you for your business!</p>
                </div>
            </div>
            <div className="mt-6 flex justify-center print-hide">
                <Button onClick={handleDownloadPdf} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
