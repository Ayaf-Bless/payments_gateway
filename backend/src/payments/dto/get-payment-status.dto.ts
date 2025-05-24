import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetPaymentStatusDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Transaction reference',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  transactionRef: string;
}

export class DetByDateDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
