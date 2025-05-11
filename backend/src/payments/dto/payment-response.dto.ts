import { PaymentStatus } from '@app/common/enums/payment-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { RecentTransactionDto } from './dashboard-stats.dto';

export class PaymentResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Transaction successfully processed' })
  message: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  transactionRef: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Transaction successfully processed' })
  message: string;

  @ApiProperty({ example: 'Insufficient funds', required: false })
  errorMessage?: string;
}

export class PaymentStatusDetailDto extends PaymentStatusResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  transactionRef: string;

  @ApiProperty({ example: 1000.0 })
  amount: number;

  @ApiProperty({ example: '2025-05-09T12:00:00Z' })
  createdAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class PaginatedPaymentStatusResponseDto {
  @ApiProperty({ type: [PaymentStatusDetailDto] })
  data: PaymentStatusDetailDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class PaginatedPaymentsResponseDto {
  data: RecentTransactionDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
