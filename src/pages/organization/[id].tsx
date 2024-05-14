import { useEffect, useState } from 'react';
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
import { Organization, Expense, OrganizationMember } from "@/utils/types";
import { OverviewSection } from "@/pages/organization/components/OverviewSection";
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app, db } from '@/utils/firebase/firebase-config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { DynamicPageProvider } from './contexts/DynamicPageContext'


export default function OrganizationAdminPanel() {
  const router = useRouter();
  const { id } = router.query;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        console.log(uid)
        if (typeof id === 'string') {
          const orgRef = doc(db, 'organizations', id);
          const orgSnapshot = await getDoc(orgRef);

          if (orgSnapshot.exists()) {
            const orgData = orgSnapshot.data() as Organization;
            if (orgData) {
              // Fetch expenses subcollection
              const expensesCollectionRef = collection(db, 'organizations', id, 'expenses');
              const expensesSnapshot = await getDocs(expensesCollectionRef);
              const expenses = expensesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Expense[];

              // Fetch members subcollection
              const membersCollectionRef = collection(db, 'organizations', id, 'members');
              const membersSnapshot = await getDocs(membersCollectionRef);
              const members = membersSnapshot.docs.map((doc) => doc.data() as OrganizationMember);

              setOrganization({
                ...orgData,
                id: orgRef.id,
                expenses,
                members,
              });
            } else {
              console.error('Organization data not found');
            }
          } else {
            console.error('Organization not found');
          }
        } else {
          console.error('Invalid organization ID');
        }
      } else {
        console.error('User not authenticated');
        setUid(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <DynamicPageProvider uid={uid}>
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
            <AddExpenseDialog organization={organization} onClose={() => setIsAddExpenseDialogOpen(false)} />
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
            <OverviewSection expenses={organization.expenses || []} organizationId={organization.id}/>
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
    </DynamicPageProvider>
  );
}