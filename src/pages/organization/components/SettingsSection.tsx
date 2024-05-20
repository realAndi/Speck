import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useDynamicPageContext } from '../contexts/DynamicPageContext';

interface SettingsSectionProps {
  organizationId: string;
}

interface GenerateInviteCodeResponse {
  code: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ organizationId }) => {
  const { toast } = useToast();
  const { uid } = useDynamicPageContext();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const functions = getFunctions();

  const generateInviteCode = async () => {
    try {
      const generateInviteCodeFunction = httpsCallable(functions, "generateInviteCode");
      const result = await generateInviteCodeFunction({ organizationId, uid });
      const data = result.data as GenerateInviteCodeResponse;
      setInviteCode(data.code);
      toast({
        title: "Invite Code Generated",
        description: `Your invite code is: ${data.code}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating invite code:", error);
      toast({
        title: "Error",
        description: "An error occurred while generating the invite code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your organization settings fields here */}
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Organization Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Description"></textarea>
            </div>
            {/* Add more settings fields as needed */}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInviteCode}>Create Invite</Button>
          {inviteCode && (
            <div className="mt-2">
              <p className="text-sm">Invite Code: <span className="font-mono">{inviteCode}</span></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};