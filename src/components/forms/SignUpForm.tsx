'use client'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/utils/firebase/firebase-config';
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
import { UpdateIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { CameraIcon } from '@radix-ui/react-icons';
import signUp from "@/utils/firebase/signup";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must contain at least 2 characters.",
  }),
  lastName: z.string().min(1, {
    message: "Last name must contain at least 1 character.",
  }),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
  profilePicture: z.union([z.instanceof(File), z.string()]).optional(),
});

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter()
  const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profilePicture: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { firstName, lastName, email, password, profilePicture } = values;
      let base64ProfilePicture = null;
      if (typeof profilePicture === 'string') {
        base64ProfilePicture = profilePicture.split(",")[1];
      }

      const userCredential = await signUp(email, password, firstName, lastName, base64ProfilePicture);
      const user = userCredential.result?.user;
      
      
      toast({
        title: "Success",
        description: "User signed up successfully",
      });
      router.push('/');
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message; 
      }
      console.error('Error signing up:', errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
          control={form.control}
          name="profilePicture"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative w-32 h-32 mx-auto">
                  <div
                    className={`w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center ${
                      profilePicturePreview ? 'border-none' : ''
                    }`}
                  >
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Profile Picture Preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <CameraIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProfilePicturePreview(reader.result as string);
                          form.setValue("profilePicture", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
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
        <div className="mt-auto">
        <Button type="submit" className='w-full' disabled={isLoading}>
          {isLoading ? (
            <UpdateIcon className="animate-spin w-4 h-4 mr-2" />
            
          ) : null}
          Sign up
        </Button>
        </div>
      </form>
    </Form>
  );
};