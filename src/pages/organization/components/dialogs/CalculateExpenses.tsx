import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Expense, User } from "@/utils/types";
import { formatDate } from "@/utils/formatDate";

interface CalculateExpensesProps {
  expenses: Expense[];
  users: { [uid: string]: User };
  avatarUrls: { [uid: string]: string | null };
}

export const CalculateExpenses: React.FC<CalculateExpensesProps> = ({ expenses, users, avatarUrls }) => {
  const [selectedExpenses, setSelectedExpenses] = useState<{ [id: string]: boolean }>({});

  const handleCheckboxChange = (expenseId: string) => {
    setSelectedExpenses(prevState => ({
      ...prevState,
      [expenseId]: !prevState[expenseId],
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Calculate Due's</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculate Due's</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {expenses.map((expense, index) => {
              const user = users[expense.createdBy];
              const avatarUrl = avatarUrls[expense.createdBy];

              if (!user) {
                return null;
              }

              return (
                <React.Fragment key={expense.id || index}>
                  <div className="flex items-center">
                    <Checkbox
                      checked={!!selectedExpenses[expense.id]}
                      onCheckedChange={() => handleCheckboxChange(expense.id!)}
                      className="mr-4"
                    />
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
                    <div className="ml-auto flex flex-col items-end space-y-1">
                      <div className="font-medium text-white">${expense.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">{formatDate(expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : expense.createdAt)}</div>
                    </div>
                  </div>
                  {index < expenses.length - 1 && <Separator className="my-4" />}
                </React.Fragment>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};