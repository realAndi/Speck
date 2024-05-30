import type { Metadata } from "next";
import RootLayout from "@/app/layout";
import { cn } from "@/lib/utils"
import "@/app/globals.css";
import { AuthContextProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "Speck Admin Panel",
  description: "Admin Panel for Speck",
};

export default function OrganizationLayout({
  children,   
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayout>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </RootLayout>
  );
}
