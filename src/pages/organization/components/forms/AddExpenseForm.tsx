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

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  businessName: z.string().optional(),
  totalCost: z.number().min(0, "Total cost must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

export const AddExpenseForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      businessName: "",
      totalCost: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      // TODO: Implement API call to add expense
      console.log("Expense values:", values);
      toast({
        title: 'Expense added successfully',
        description: 'The expense has been added.',
        variant: 'default',
      });
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description of Expense*</FormLabel>
              <FormControl>
                <Input {...field} />
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