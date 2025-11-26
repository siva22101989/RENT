
'use client';

import { useState, useTransition } from 'react';
import { deleteBillingRecord } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function DeleteBillingDialog({ recordId, children }: { recordId: string, children: React.ReactNode }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const formData = new FormData();
        formData.append('recordId', recordId);
        
        startTransition(async () => {
            await deleteBillingRecord(formData);
            toast({
                title: 'Success',
                description: `Record ${recordId} has been deleted.`,
            });
        });
    };

    return (
        <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the billing record {recordId}.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}
