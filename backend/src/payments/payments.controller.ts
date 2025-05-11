import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DelayInterceptor } from '../common/interceptors/delay.interceptor';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  PaymentResponseDto,
  PaymentStatusResponseDto,
  PaginatedPaymentStatusResponseDto,
  PaginatedPaymentsResponseDto,
} from './dto/payment-response.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  DashboardStatsDto,
  RecentTransactionDto,
} from './dto/dashboard-stats.dto';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60 } }) // Default: 30 requests per minute
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseInterceptors(new DelayInterceptor(100))
  @Throttle({ createPayment: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsService.createPayment(
      createPaymentDto,
      req.user.sub,
    );
    switch (payment.status) {
      case 'PENDING':
        return {
          statusCode: 100,
          message: 'Transaction Pending',
          transactionRef: payment.transactionRef,
        };
      case 'SUCCESSFUL':
        return {
          statusCode: 200,
          message: 'Transaction successfully processed',
          transactionRef: payment.transactionRef,
        };
      case 'FAILED':
        return {
          statusCode: 400,
          message: `Transaction failed ${payment.errorMessage || ''}`,
          transactionRef: payment.transactionRef,
        };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated payments',
    type: PaginatedPaymentsResponseDto,
  })
  async getAllPayments(@Query() paginationDto: PaginationDto, @Req() req) {
    return this.paymentsService.getAllPayments(req.user.sub, paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  async getStats(
    @Req() req,
  ): Promise<{ statusCode: number; message: string; data: DashboardStatsDto }> {
    const userId = req.user.sub;
    const stats = await this.paymentsService.getDashboardStats(userId);

    return {
      statusCode: 200,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent transactions retrieved successfully',
    type: [RecentTransactionDto],
  })
  async getRecentTransactions(
    @Req() req,
    @Query('limit') limit?: number,
  ): Promise<{
    statusCode: number;
    message: string;
    data: RecentTransactionDto[];
  }> {
    const userId = req.user.sub;
    const transactions = await this.paymentsService.getRecentTransactions(
      userId,
      limit || 5,
    );

    return {
      statusCode: 200,
      message: 'Recent transactions retrieved successfully',
      data: transactions,
    };
  }

  @Get(':ref')
  @Throttle({ getStatus: { limit: 10, ttl: 60 } }) // 10 requests per minute for status check
  @ApiOperation({ summary: 'Get payment status by transaction reference' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment status',
    type: PaymentStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentStatus(
    @Param('ref') transactionRef: string,
    @Req() req,
  ): Promise<Payment> {
    return this.paymentsService.getPaymentByReference(
      req.user.sub,
      transactionRef,
    );
  }

  @Get()
  @Throttle({ listPayments: { limit: 20, ttl: 60 } }) // 20 requests per minute for listing
  @ApiOperation({ summary: 'Get all payment statuses with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated payment statuses',
    type: PaginatedPaymentStatusResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllPaymentStatuses(
    @Query() paginationDto: PaginationDto,
    @Req() req,
  ): Promise<PaginatedPaymentStatusResponseDto> {
    return this.paymentsService.getAllPaymentStatuses(
      req.user.sub,
      paginationDto,
    );
  }
}
