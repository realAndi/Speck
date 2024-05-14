import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Expense, User } from "@/utils/types";
import { getDocs, doc, getDoc, collection, Timestamp } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { Separator } from "@/components/ui/separator";
import { db } from "@/utils/firebase/firebase-config";

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
        console.log("Cached data found:", { expenses, users, avatarUrls, timestamp });
        if (now - timestamp < 60000) { // 1 minute = 60000 milliseconds
          setExpenses(expenses);
          setUsers(users);
          setAvatarUrls(avatarUrls);
          console.log("Using cached data");
          return;
        }
      }
  
      console.log("Fetching data from Firestore");
      const expensesSnapshot = await getDocs(collection(db, "organizations", organizationId, "expenses"));
      const fetchedExpenses: Expense[] = expensesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdBy: data.createdBy.id, // Store the id of the createdBy reference
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
  
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ expenses: fetchedExpenses, users: fetchedUsers, avatarUrls: fetchedAvatarUrls, timestamp: now })
      );
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
    <>
        {sortedExpenses.map((expense, index) => {
          const user = users[expense.createdBy];
          const avatarUrl = avatarUrls[expense.createdBy];
          
          if (!user) {
            return null;
          }
          
          return (
            <React.Fragment key={expense.id}>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Avatar" />
                  ) : (
                    <AvatarFallback>
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{expense.title}</p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
                <div className="ml-auto font-medium">${expense.totalCost.toFixed(2)}</div>
              </div>
              {index < sortedExpenses.length - 1 && <Separator className="my-4" />}
            </React.Fragment>
          );
        })}
    </>
  );
};