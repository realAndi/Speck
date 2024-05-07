import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddExpenseForm } from "../forms/AddExpenseForm";

export const AddExpenseDialog = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Expense</DialogTitle>
      </DialogHeader>
      <AddExpenseForm />
    </>
  );
};