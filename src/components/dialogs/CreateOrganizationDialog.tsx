import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateOrgForm } from '@/components/forms/createOrgForm';


export const CreateOrganizationDialog = () => {
  return (
      <>
      <DialogHeader>
        <DialogTitle>Create Organization</DialogTitle>
      </DialogHeader>
      <CreateOrgForm />
      </>
  );
};