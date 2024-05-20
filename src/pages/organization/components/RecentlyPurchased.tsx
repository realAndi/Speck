import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Expense, User } from "@/utils/types";
import { getDocs, doc, getDoc, collection, Timestamp } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { Separator } from "@/components/ui/separator";
import { db } from "@/utils/firebase/firebase-config";
import { ScrollArea } from "@/components/ui/scroll-area"

interface RecentlyPurchasedProps {
  organizationId: string;
}

export const RecentlyPurchased: React.FC<RecentlyPurchasedProps> = ({ organizationId }) => {
  const [users, setUsers] = useState<{ [uid: string]: User }>({});
  const [avatarUrls, setAvatarUrls] = useState<{ [uid: string]: string | null }>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = `expenses_${organizationId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
        const { expenses, users, avatarUrls, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < 60000) { // 1 minute = 60000 milliseconds
          const deserializedExpenses = expenses.map((expense: Expense) => ({
            ...expense,
            createdAt: expense.createdAt ? 
              (expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : new Date(expense.createdAt)) 
              : undefined,
          }));
          setExpenses(deserializedExpenses);
          setUsers(users);
          setAvatarUrls(avatarUrls);
          return;
        }
      }

      const expensesSnapshot = await getDocs(collection(db, "organizations", organizationId, "expenses"));
      const fetchedExpenses: Expense[] = expensesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdBy: data.createdBy.id, // Store the id of the createdBy reference
          createdAt: data.createdAt ? data.createdAt.toDate() : undefined, // Convert to Date object
        };
      }) as Expense[];

      const userIds = Array.from(new Set(fetchedExpenses.map((expense) => expense.createdBy)));
      const usersSnapshot = await Promise.all(
        userIds.map((userId) => getDoc(doc(db, "users", userId)))
      );
      const fetchedUsers: { [uid: string]: User } = usersSnapshot.reduce(
        (acc, userDoc) => ({
          ...acc,
          [userDoc.id]: userDoc.data() as User,
        }),
        {}
      );

      const storage = getStorage();
      const avatarUrlsPromises = userIds.map(async (userId) => {
        const profileRef = ref(storage, `users/${userId}/profile`);
        const profileList = await listAll(profileRef);
        if (profileList.items.length > 0) {
          const avatarUrl = await getDownloadURL(profileList.items[0]).catch(() => null);
          return { userId, avatarUrl };
        }
        return { userId, avatarUrl: null };
      });
      const avatarUrlsData = await Promise.all(avatarUrlsPromises);
      const fetchedAvatarUrls: { [uid: string]: string | null } = avatarUrlsData.reduce(
        (acc, { userId, avatarUrl }) => ({
          ...acc,
          [userId]: avatarUrl,
        }),
        {}
      );

      setExpenses(fetchedExpenses);
      setUsers(fetchedUsers);
      setAvatarUrls(fetchedAvatarUrls);

      localStorage.setItem(cacheKey, JSON.stringify({
        expenses: fetchedExpenses,
        users: fetchedUsers,
        avatarUrls: fetchedAvatarUrls,
        timestamp: now,
      }));
    };

    fetchData();
  }, [organizationId]);

  const sortedExpenses = expenses.sort((a, b) => {
    const getTimestamp = (date: Date | Timestamp | undefined) => {
      if (date instanceof Timestamp) {
        return date.toMillis();
      } else if (date instanceof Date) {
        return date.getTime();
      } else {
        return 0;
      }
    };

    const createdAtA = getTimestamp(a.createdAt);
    const createdAtB = getTimestamp(b.createdAt);

    return createdAtB - createdAtA;
  });
  
  return (
    <ScrollArea>
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Recently Purchased</h2>
      {sortedExpenses.map((expense, index) => {
        const user = users[expense.createdBy];
        const avatarUrl = avatarUrls[expense.createdBy];
        
        if (!user) {
          return null;
        }
        
        return (
          <React.Fragment key={expense.id}>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Avatar className="h-10 w-10 transition-transform duration-200 hover:ring-2 hover:ring-blue-500 hover:scale-105">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt="Avatar" />
                      ) : (
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none text-white">{expense.title}</p>
                <p className="text-sm text-gray-400">{expense.description}</p>
              </div>
              <div className="ml-auto font-medium text-white">${expense.totalCost.toFixed(2)}</div>
            </div>
            {index < sortedExpenses.length - 1 && <Separator className="my-4" />}
          </React.Fragment>
        );
      })}
    </div>
    </ScrollArea>
  );
};