import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { User } from '../users/entities/user.entity';
import { InMemoryCacheService } from '../cache/in-memory-cache.service';
import { PaymentType } from '../common/enums/payment-type.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let paymentsRepository: Repository<Payment>;
  let usersRepository: Repository<User>;
  let cacheService: InMemoryCacheService;

  const mockPaymentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: InMemoryCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheService = module.get<InMemoryCacheService>(InMemoryCacheService);
  });

  it('should be defined', () => {
    expect(paymentsService).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create and return a payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        payer: '0712345678',
        payee: '0787654321',
        amount: 100.5,
        currency: 'UGX',
        payerReference: 'INV-2023-001',
      };
      const userId = 'payer-user-id';
      const payerUser = { id: userId, accountNumber: createPaymentDto.payer };
      const payeeUser = {
        id: 'payee-user-id',
        accountNumber: createPaymentDto.payee,
      };
      mockUsersRepository.findOne
        .mockResolvedValueOnce(payerUser) // for payer
        .mockResolvedValueOnce(payeeUser); // for payee
      const mockPayment = {
        ...createPaymentDto,
        id: 'payment-id',
        status: PaymentStatus.SUCCESSFUL,
        errorMessage: null,
        transactionRef: 'transaction-ref',
        userId,
        payerId: userId,
        payeeId: payeeUser.id,
        type: PaymentType.OUTGOING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPaymentsRepository.create.mockReturnValue(mockPayment);
      mockPaymentsRepository.save.mockResolvedValue(mockPayment);
      mockCacheService.set.mockResolvedValue(undefined);
      // Mock Math.random to return a fixed value (85% success rate scenario)
      const mockMathRandom = jest
        .spyOn(global.Math, 'random')
        .mockReturnValue(0.5);
      const result = await paymentsService.createPayment(
        createPaymentDto,
        userId,
      );
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockPaymentsRepository.create).toHaveBeenCalled();
      expect(mockPaymentsRepository.save).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
      mockMathRandom.mockRestore();
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status when payment exists and not cached', async () => {
      const userId = 'user-id';
      const transactionRef = 'transaction-ref';
      const mockPayment = {
        id: 'payment-id',
        status: PaymentStatus.SUCCESSFUL,
        errorMessage: null,
        transactionRef,
        userId,
        payerId: userId,
        payeeId: 'payee-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCacheService.get.mockResolvedValue(undefined);
      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);
      mockCacheService.set.mockResolvedValue(undefined);
      const result = await paymentsService.getPaymentStatus(
        transactionRef,
        userId,
      );
      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockPaymentsRepository.findOne).toHaveBeenCalledWith({
        where: { transactionRef, userId },
        relations: ['user', 'payerUser', 'payeeUser'],
      });
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(result.status).toEqual(PaymentStatus.SUCCESSFUL);
    });

    it('should return cached payment status if present', async () => {
      const userId = 'user-id';
      const transactionRef = 'transaction-ref';
      const cachedStatus = {
        status: PaymentStatus.PENDING,
        statusCode: 100,
        message: 'Transaction Pending',
      };
      mockCacheService.get.mockResolvedValue(cachedStatus);
      const result = await paymentsService.getPaymentStatus(
        transactionRef,
        userId,
      );
      expect(mockCacheService.get).toHaveBeenCalled();
      expect(result).toEqual(cachedStatus);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      const userId = 'user-id';
      const transactionRef = 'non-existent-ref';
      mockCacheService.get.mockResolvedValue(undefined);
      mockPaymentsRepository.findOne.mockResolvedValue(null);
      await expect(
        paymentsService.getPaymentStatus(transactionRef, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
