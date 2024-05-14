import { DocumentReference, Timestamp } from "firebase/firestore";

export interface HeaderProps {
  isLoggedIn: boolean;
  userFirstName: string;
}

export interface AuthDialogProps {
  trigger: React.ReactNode;
}

export interface CreateOrganizationDialogProps {
  trigger: React.ReactNode;
}

export interface Organization {
  id: string;
  name: string;
  owner: string;
  type: string;
  description?: string;
  groupPictureURL?: string;
  createdAt?: Date;
  expenses?: Expense[];
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: Date;
}

export interface Expense {
  id?: string;
  title: string;
  description?: string;
  businessName?: string;
  totalCost: number;
  createdBy: string;
  createdAt?: Timestamp;
  user: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  organizations?: DocumentReference[];
  createdAt?: Timestamp;
}