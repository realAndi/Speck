export type HeaderProps = {
    isLoggedIn: boolean;
    userFirstName: string;
  };

export type AuthDialogProps = {
    trigger: React.ReactNode;
  };

export type CreateOrganizationDialogProps = {
    trigger: React.ReactNode;
  };

  export interface Organization {
    id?: number;
    name: string;
    owner_id: string;
    useCase: string;
  }
  
  export interface OrganizationMember {
    id?: number;
    user_id: string;
    organization_id: number;
    role: string;
    joined_at: Date;
  }