import { PaymentStatus } from '@app/common/enums/payment-status.enum';

export class DashboardStatsDto {
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  pendingAmount: number;
  currency: string;
}

export class RecentTransactionDto {
  id: string;
  transactionRef: string;
  amount: number;
  currency: string;
  payer: string;
  payee: string;
  status: PaymentStatus;
  createdAt: Date;
  payerReference: string;
  type: string;
}

export class DashboardResponseDto {
  stats: DashboardStatsDto;
  recentTransactions: RecentTransactionDto[];
}
