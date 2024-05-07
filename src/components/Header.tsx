"use client"

import React, { useState } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { HeaderProps } from "../utils/types";
import { AuthDialog } from "./dialogs/authDialog";
import Link from "next/link";
import { CreateOrganizationDialog } from "./dialogs/CreateOrganizationDialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { app } from '@/utils/firebase/firebase-config';
import { getAuth, signOut } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Header() {
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const router = useRouter()
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push('/');
      toast({
        title: "Success",
        description: "User signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while signing out",
      });
    }
  };

  return (
    <header className="flex items-center p-4 bg-background">
      <div className="text-2xl font-bold">Speck</div>
      <NavigationMenu>
        <NavigationMenuList>
          {!isAuthenticated && (
            <NavigationMenuItem>
              <AuthDialog trigger={<NavigationMenuLink className={navigationMenuTriggerStyle()}>Login</NavigationMenuLink>} />
            </NavigationMenuItem>
          )}
          {isAuthenticated && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Organizations</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => setIsCreateOrgDialogOpen(true)}
                  >
                    Create Organization
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Join Organization
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
          {isAuthenticated && (
            <NavigationMenuItem>
              <NavigationMenuLink 
                className={navigationMenuTriggerStyle()} 
                onClick={handleLogout}
              >
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
        <DialogContent>
          <CreateOrganizationDialog />
        </DialogContent>
      </Dialog>
    </header>
  );
}