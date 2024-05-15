import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormValidationErrors,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UpdateIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from '@/components/ui/textarea';

import { getFunctions, httpsCallable } from "firebase/functions";
import { useDynamicPageContext } from '../../contexts/DynamicPageContext'
import { Organization } from '@/utils/types';

interface AddExpenseFormProps {
  organization: Organization;
  onSuccess: () => void;
}


const formSchema = z.object({
  title: z.string().min(1, "Description is required"),
  description: z.string().optional(),
  businessName: z.string().optional(),
  totalCost: z.string().refine(
    (value) => {
      const regex = /^\d+(\.\d{1,2})?$/;
      return regex.test(value);
    },
    { message: "Total cost must be a valid number with up to 2 decimal places" }
  ).transform((value) => parseFloat(value)),
});

type FormValues = z.infer<typeof formSchema>;

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ organization, onSuccess }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { uid } = useDynamicPageContext();
  const functions = getFunctions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      businessName: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    console.log(uid)
    try {
      const addExpenseFunction = httpsCallable(functions, "addExpense");
      await addExpenseFunction({
        organizationId: organization.id,
        expense: {
          title: values.title,
          description: values.description,
          businessName: values.businessName,
          totalCost: values.totalCost,
          createdBy: uid,
        },
      });

      toast({
        title: 'Expense added successfully',
        description: 'The expense has been added.',
        variant: 'default',
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error adding expense',
        description: 'An error occurred while adding the expense. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                    placeholder="Write a unique description about the expense!"
                    className="resize-none"
                    {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
               <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Cost*</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormValidationErrors />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <UpdateIcon className="animate-spin w-4 h-4 mr-2" />
          ) : null}
          Add Expense
        </Button>
      </form>
    </Form>
  );
};