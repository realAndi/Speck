// Import necessary libraries and hooks
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UpdateIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { useAuthContext } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable } from "firebase/functions";


// Define form validation schema using Zod
const formSchema = z.object({
  orgName: z.string().min(4, "Organization name must be at least 4 characters long.")
    .regex(/^[a-zA-Z0-9_.\s]*$/, "Organization name can only contain letters, numbers, underscores, and periods."),
  useCase: z.enum(["Personal", "Social Circle", "Organization"]),

});

type FormValues = z.infer<typeof formSchema>;


// Functional component for organization creation form
export const CreateOrgForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const  user  = useAuthContext();
  const router = useRouter();
  const functions = getFunctions();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
      useCase: "Personal",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to create an organization.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
  
    try {
      const createOrganizationFunction = httpsCallable(functions, "createOrganization");
      const result = await createOrganizationFunction({
        orgName: values.orgName,
        ownerId: user.uid,
        useCase: values.useCase,
      });

      const organizationId = (result.data as { organizationId: string }).organizationId;
      if (organizationId) {
        toast({
          title: "Organization created successfully",
          description: "Your organization has been created.",
          variant: "default",
        });
        router.push(`/organization/${organizationId}`);
      } else {
        console.error("Organization ID is empty or undefined");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error creating organization",
        description: "An error occurred while creating the organization. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 justify-between h-full p-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="orgName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="useCase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Use Case</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a use case" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Social Circle">Social Circle</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormValidationErrors />
        </div>
        <Button type="submit" className='w-full' disabled={isLoading}>
          {isLoading ? (
            <UpdateIcon className="animate-spin w-4 h-4 mr-2" />
          ) : null}
          Create Organization
        </Button>
      </form>
    </Form>
  );
};