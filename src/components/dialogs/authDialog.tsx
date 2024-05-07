'use client'

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { SignUpForm } from '../forms/SignUpForm';
import { LoginForm } from '../forms/LoginForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from "../ui/button";
import { AuthDialogProps } from "../../utils/types";


export const AuthDialog: React.FC<AuthDialogProps> = ({ trigger }) => {
    return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-10">
        <Tabs defaultValue="signup">
          <TabsList aria-label="Login or Sign Up" className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <DialogHeader>
              <DialogTitle>Sign Up</DialogTitle>
            </DialogHeader>
            <SignUpForm />
          </TabsContent>
          <TabsContent value="login">
            <DialogHeader>
              <DialogTitle>Log In</DialogTitle>
            </DialogHeader>
            <LoginForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};