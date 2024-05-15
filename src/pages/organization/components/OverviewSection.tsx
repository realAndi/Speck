import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentlyPurchased } from "./RecentlyPurchased";
import { RecentlyPurchasedChart } from "./RecentlyPurchasedChart";
import { Expense } from "@/utils/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase-config"

interface OverviewSectionProps {
  expenses: Expense[];
  organizationId: string;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ expenses, organizationId }) => {
  const totalSpent = expenses.reduce((total, expense) => total + expense.totalCost, 0);
  const totalPurchases = expenses.length;
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    const fetchTotalMembers = async () => {
      const storedTotalMembers = localStorage.getItem('totalMembers');
      const storedTimestamp = localStorage.getItem('totalMembersTimestamp');

      if (storedTotalMembers && storedTimestamp) {
        const parsedTotalMembers = parseInt(storedTotalMembers, 10);
        const parsedTimestamp = parseInt(storedTimestamp, 10);
        const currentTime = Date.now();

        if (currentTime - parsedTimestamp <= 60000) {
          console.log('Fetching total members from cache');
          setTotalMembers(parsedTotalMembers);
          return;
        }
      }
      console.log('Fetching total members from database');

      try {
        const membersCollectionRef = collection(db, "organizations", organizationId, "members");
        const membersSnapshot = await getDocs(membersCollectionRef);
        const totalMembers = membersSnapshot.size;
        setTotalMembers(totalMembers);

        localStorage.setItem('totalMembers', totalMembers.toString());
        localStorage.setItem('totalMembersTimestamp', Date.now().toString());
      } catch (error) {
        console.error("Error fetching total members:", error);
      }
    };

    fetchTotalMembers();
  }, [organizationId]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Left in Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,518.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
      </div>
      <div className="min-h-[500px] grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <RecentlyPurchasedChart />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <RecentlyPurchased organizationId={organizationId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};