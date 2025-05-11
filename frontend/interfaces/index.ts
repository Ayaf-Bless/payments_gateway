export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
  accountNumber: string;
}

export interface Payment {
  id: string;
  payer: string;
  payee: string;
  amount: number;
  currency: string;
  payerReference: string;
  status: PaymentStatus;
  errorMessage: string;
  transactionRef: string;
  user: UserProfile;
  userId: string;
  type: string;
  payeeName: string;
  payerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}

export interface DashboardStats {
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  pendingAmount: number;
}
