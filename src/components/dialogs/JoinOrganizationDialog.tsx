import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthContext } from "@/contexts/AuthContext";

export const JoinOrganizationDialog: React.FC = () => {
  const { toast } = useToast();
  const  user  = useAuthContext();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const functions = getFunctions();

  const handleJoinOrganization = async () => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to join an organization.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const joinOrganizationFunction = httpsCallable(functions, "joinOrganization");
      const result = await joinOrganizationFunction({
        code: inviteCode,
        userId: user.uid,
      });

      toast({
        title: "Joined successfully",
        description: "You have joined the organization.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error joining organization:", error);
      toast({
        title: "Error",
        description: "An error occurred while joining the organization. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Join Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button onClick={handleJoinOrganization} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};