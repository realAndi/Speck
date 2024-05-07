import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { AddExpenseDialog } from "./components/dialogs/AddExpenseDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Organization } from "@/utils/types";
import { RecentlyPurchasedSection } from "@/pages/organization/components/RecentlyPurchasedSection";

export default function OrganizationAdminPanel({ organization }: { organization: Organization }) {
  const router = useRouter();
  const { id } = router.query;
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="ml-auto flex items-center space-x-4">
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{organization.name}</h2>
          <div className="flex items-center space-x-2">
          <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <AddExpenseDialog />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
            <RecentlyPurchasedSection />
        </TabsContent>
        <TabsContent value="my-purchases" className="space-y-4">
            {/* Add reports content */}
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
            {/* Add members list */}
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
            {/* Add organization settings */}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}