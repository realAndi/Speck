import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthContextProvider } from '@/contexts/AuthContext'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Speck",
  description: "Your budgeting app!",
};

export default function RootLayout({
  children,   
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
          <main>
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
