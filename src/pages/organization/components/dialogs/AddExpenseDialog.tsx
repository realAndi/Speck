import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddExpenseForm } from "../forms/AddExpenseForm";
import { Organization } from '@/utils/types';

interface AddExpenseDialogProps {
  organization: Organization;
  onClose: () => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ organization, onClose }) => {
  const handleSuccess = () => {
    onClose();
  };
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Expense</DialogTitle>
      </DialogHeader>
      <AddExpenseForm organization={organization} onSuccess={handleSuccess} />
    </>
  );
};