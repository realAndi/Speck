import type { Metadata } from "next";
import RootLayout from "@/app/layout";
import { cn } from "@/lib/utils"
import "@/app/globals.css";

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
        {children}
    </RootLayout>
  );
}
