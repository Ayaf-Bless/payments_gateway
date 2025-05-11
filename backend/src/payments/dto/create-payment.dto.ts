import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: '0712345678',
    description: 'Payer account number (10 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'Payer must be a 10-digit number' })
  payer: string;

  @ApiProperty({
    example: '0787654321',
    description: 'Payee account number (10 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'Payee must be a 10-digit number' })
  payee: string;

  @ApiProperty({ example: 100.5, description: 'Payment amount' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'UGX', description: 'Currency ISO code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    example: 'INV-2023-001',
    description: 'Payer reference (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  payerReference?: string;
}
