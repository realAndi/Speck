'use client'

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
import { useRouter } from 'next/navigation';
import signIn from "@/utils/firebase/signin";
import { useAuthContext } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[0-9]/, "Password must include at least one number.")
});

export const LoginForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter()
  const { user, isAuthenticated } = useAuthContext();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
  
    const { result, error } = await signIn(values.email, values.password);
  
    setIsLoading(false);
  
    if (error) {
      console.error('Error logging in:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: JSON.stringify(error),
      });
    } else {
      console.log('User logged in:', result);
      toast({
        title: "Success",
        description: "User logged in successfully",
      });
      router.push('/')
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between h-full">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        <FormValidationErrors />
        </div>
        <Button type="submit" className='w-full' disabled={isLoading}>
          {isLoading ? (
            <UpdateIcon className="animate-spin w-4 h-4 mr-2" />
            
          ) : null}
          Log in
        </Button>      </form>
    </Form>
  );
};