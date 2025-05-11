import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { PaymentType } from '../common/enums/payment-type.enum';
import {
  PaymentStatusResponseDto,
  PaginatedPaymentStatusResponseDto,
  PaginatedPaymentsResponseDto,
} from './dto/payment-response.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import {
  DashboardStatsDto,
  RecentTransactionDto,
} from './dto/dashboard-stats.dto';
import { InMemoryCacheService } from '../cache/in-memory-cache.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: InMemoryCacheService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    const { payer, payee, amount, currency, payerReference } = createPaymentDto;

    // Verify that payer exists
    const payerUser = await this.usersRepository.findOne({
      where: { accountNumber: payer },
    });
    if (!payerUser) {
      throw new BadRequestException(
        `Payer with account number ${payer} not found`,
      );
    }

    // Verify that payee exists
    const payeeUser = await this.usersRepository.findOne({
      where: { accountNumber: payee },
    });
    if (!payeeUser) {
      throw new BadRequestException(
        `Payee with account number ${payee} not found`,
      );
    }

    // Verify that the user owns the payer account
    if (payerUser.id !== userId) {
      throw new BadRequestException(
        'You can only make payments from your own account',
      );
    }

    // Generate transaction reference
    const transactionRef = uuidv4();

    // Determine payment status (simulating payment processing)
    const random = Math.random() * 100;
    let status: PaymentStatus;
    let errorMessage: string = null;

    if (random < 10) {
      status = PaymentStatus.PENDING;
    } else if (random < 95) {
      status = PaymentStatus.SUCCESSFUL;
    } else {
      status = PaymentStatus.FAILED;
      errorMessage = 'Insufficient funds';
    }

    // Create a single payment record with references to both payer and payee
    const payment = this.paymentsRepository.create({
      payer,
      payee,
      amount,
      currency,
      payerReference,
      status,
      errorMessage,
      transactionRef,
      userId: payerUser.id, // The transaction is owned by the payer
      payerId: payerUser.id,
      payeeId: payeeUser.id,
      type: PaymentType.OUTGOING, // From payer's perspective, it's outgoing
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Cache the payment status for 30 minutes (1800 seconds)
    const cacheKey = `payment:${userId}:${transactionRef}`;
    await this.cacheService.set(
      cacheKey,
      {
        status: savedPayment.status,
        statusCode: this.getStatusCode(savedPayment.status),
        message: this.getStatusMessage(
          savedPayment.status,
          savedPayment.errorMessage,
        ),
        ...(savedPayment.errorMessage && {
          errorMessage: savedPayment.errorMessage,
        }),
      },
      1800, // 30 minutes in seconds
    );

    return savedPayment;
  }

  async getAllPayments(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedPaymentsResponseDto> {
    const { page = 1, limit = 10 } = paginationDto;

    // Find payments where the user is either the payer or the payee
    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.payerUser', 'payerUser')
      .leftJoinAndSelect('payment.payeeUser', 'payeeUser')
      .where([{ payerId: userId }, { payeeId: userId }])
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.createdAt', 'DESC');

    const [payments, total] = await queryBuilder.getManyAndCount();

    const data = payments.map((payment) => {
      // Determine if this is incoming or outgoing from the perspective of the current user
      const type =
        payment.payerId === userId
          ? PaymentType.OUTGOING
          : PaymentType.INCOMING;

      return {
        id: payment.id,
        transactionRef: payment.transactionRef,
        amount: payment.amount,
        currency: payment.currency,
        payer: payment.payer,
        payee: payment.payee,
        status: payment.status,
        createdAt: payment.createdAt,
        payerReference: payment.payerReference || '',
        type, // Set based on user's relationship to the payment
        payerName: payment.payerUser?.firstName || 'Unknown',
        payeeName: payment.payeeUser?.firstName || 'Unknown',
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentByReference(
    userId: string,
    transactionRef: string,
  ): Promise<Payment | null> {
    return this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.payerUser', 'payerUser')
      .leftJoinAndSelect('payment.payeeUser', 'payeeUser')
      .where('payment.transactionRef = :transactionRef', { transactionRef })
      .andWhere('(payment.payerId = :userId OR payment.payeeId = :userId)', {
        userId,
      })
      .getOne();
  }

  async getPaymentStatus(
    transactionRef: string,
    userId: string,
    cacheKey?: string,
  ): Promise<PaymentStatusResponseDto> {
    const cacheKeyToUse = cacheKey || `payment:${userId}:${transactionRef}`;
    const cachedPayment = await this.cacheService.get<PaymentStatusResponseDto>(
      cacheKeyToUse,
    );

    if (cachedPayment) {
      return cachedPayment;
    }

    const payment = await this.paymentsRepository.findOne({
      where: { transactionRef, userId },
      relations: ['user', 'payerUser', 'payeeUser'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with transaction reference ${transactionRef} not found`,
      );
    }

    const response = {
      status: payment.status,
      statusCode: this.getStatusCode(payment.status),
      message: this.getStatusMessage(payment.status, payment.errorMessage),
      ...(payment.errorMessage && { errorMessage: payment.errorMessage }),
    };

    // Cache the result for 30 minutes (1800 seconds)
    await this.cacheService.set(cacheKeyToUse, response, 1800);
    return response;
  }

  async getAllPaymentStatuses(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedPaymentStatusResponseDto> {
    const { page = 1, limit = 10 } = paginationDto;

    // Get payments where user is either payer or payee
    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .where([{ payerId: userId }, { payeeId: userId }])
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.createdAt', 'DESC');

    const [payments, total] = await queryBuilder.getManyAndCount();

    const paymentStatuses = payments.map((payment) => {
      // Determine if this is incoming or outgoing from the perspective of the current user
      const type =
        payment.payerId === userId
          ? PaymentType.OUTGOING
          : PaymentType.INCOMING;

      return {
        transactionRef: payment.transactionRef,
        status: payment.status,
        statusCode: this.getStatusCode(payment.status),
        message: this.getStatusMessage(payment.status, payment.errorMessage),
        ...(payment.errorMessage && { errorMessage: payment.errorMessage }),
        amount: payment.amount,
        createdAt: payment.createdAt,
        type,
      };
    });

    return {
      data: paymentStatuses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getStatusCode(status: PaymentStatus): number {
    switch (status) {
      case PaymentStatus.PENDING:
        return 100;
      case PaymentStatus.SUCCESSFUL:
        return 200;
      case PaymentStatus.FAILED:
        return 400;
    }
  }

  private getStatusMessage(
    status: PaymentStatus,
    errorMessage?: string,
  ): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Transaction Pending';
      case PaymentStatus.SUCCESSFUL:
        return 'Transaction successfully processed';
      case PaymentStatus.FAILED:
        return `Transaction failed ${errorMessage || ''}`;
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStatsDto> {
    // Get user with currency information
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Helper function to parse decimal sums
    const parseDecimal = (value: string | null) =>
      value ? parseFloat(value) : 0;

    // Execute all queries in parallel for better performance
    const [totalTransactions, sentResult, receivedResult, pendingResult] =
      await Promise.all([
        // Total transactions (both sent and received)
        this.paymentsRepository.count({
          where: [
            { userId }, // Sent payments
            { payeeId: userId }, // Received payments
          ],
        }),

        // Total sent (successful outgoing)
        this.paymentsRepository
          .createQueryBuilder('payment')
          .select('SUM(payment.amount)', 'total')
          .where('payment.userId = :userId', { userId })
          .andWhere('payment.status = :status', {
            status: PaymentStatus.SUCCESSFUL,
          })
          .andWhere('payment.type = :type', {
            type: PaymentType.OUTGOING,
          })
          .getRawOne(),

        // Total received (successful incoming)
        this.paymentsRepository
          .createQueryBuilder('payment')
          .select('SUM(payment.amount)', 'total')
          .where('payment.payeeId = :userId', { userId })
          .andWhere('payment.status = :status', {
            status: PaymentStatus.SUCCESSFUL,
          })
          .getRawOne(),

        // Pending amount (outgoing pending)
        this.paymentsRepository
          .createQueryBuilder('payment')
          .select('SUM(payment.amount)', 'total')
          .where('payment.userId = :userId', { userId })
          .andWhere('payment.status = :status', {
            status: PaymentStatus.PENDING,
          })
          .getRawOne(),
      ]);

    return {
      totalTransactions,
      totalSent: parseDecimal(sentResult?.total),
      totalReceived: parseDecimal(receivedResult?.total),
      pendingAmount: parseDecimal(pendingResult?.total),
      currency: user.currency ?? 'UGX', // Default to USD if not set
    };
  }

  async getRecentTransactions(
    userId: string,
    limit = 5,
  ): Promise<RecentTransactionDto[]> {
    // Get transactions where the user is either payer or payee
    const recentPayments = await this.paymentsRepository.find({
      where: [{ payerId: userId }, { payeeId: userId }],
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['payerUser', 'payeeUser'], // pull in the user-names
    });

    return recentPayments.map((payment) => {
      // Determine if this is incoming or outgoing from the perspective of the current user
      const type =
        payment.payerId === userId
          ? PaymentType.OUTGOING
          : PaymentType.INCOMING;

      return {
        id: payment.id,
        transactionRef: payment.transactionRef,
        amount: payment.amount,
        currency: payment.currency,
        payer: payment.payer,
        payee: payment.payee,
        status: payment.status,
        createdAt: payment.createdAt,
        payerReference: payment.payerReference || '',
        type,
        payerName: payment.payerUser?.firstName || 'Unknown',
        payeeName: payment.payeeUser?.firstName || 'Unknown',
      };
    });
  }
}
