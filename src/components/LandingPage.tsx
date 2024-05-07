'use client'

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { AuthDialog } from "./dialogs/authDialog";
import { useAuthContext } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthContext();
  console.log(isAuthenticated)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <header className="text-6xl font-bold mb-8">
        Speck
      </header>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold">
          Manage your expenses and track your spending!
        </h2>
        <p>Sign in or create an account to get started</p>
      </div>
      {!isAuthenticated && (
        <AuthDialog
        trigger={<Button>Sign up!</Button>}
        />
      )}
      {isAuthenticated && (
        <div>
          <p>Welcome!</p>
        </div>
      )}
    </div>
  );
}