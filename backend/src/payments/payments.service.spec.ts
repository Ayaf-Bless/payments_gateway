import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let paymentsRepository: Repository<Payment>;

  const mockPaymentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
  });

  it('should be defined', () => {
    expect(paymentsService).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create and return a payment', async () => {
      const createPaymentDto = {
        payer: '0712345678',
        payee: '0787654321',
        amount: 100.5,
        currency: 'UGX',
        payerReference: 'INV-2023-001',
      };

      const userId = 'user-id';

      const mockPayment = {
        ...createPaymentDto,
        id: 'payment-id',
        status: PaymentStatus.SUCCESSFUL,
        errorMessage: null,
        transactionRef: 'transaction-ref',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentsRepository.create.mockReturnValue(mockPayment);
      mockPaymentsRepository.save.mockResolvedValue(mockPayment);

      // Mock Math.random to return a fixed value (85% success rate scenario)
      const mockMathRandom = jest
        .spyOn(global.Math, 'random')
        .mockReturnValue(0.5);

      const result = await paymentsService.createPayment(
        createPaymentDto,
        userId,
      );

      expect(mockPaymentsRepository.create).toHaveBeenCalled();
      expect(mockPaymentsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);

      mockMathRandom.mockRestore();
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status when payment exists', async () => {
      const mockPayment = {
        id: 'payment-id',
        status: PaymentStatus.SUCCESSFUL,
        errorMessage: null,
        transactionRef: 'transaction-ref',
      };

      mockPaymentsRepository.findOne.mockResolvedValue(mockPayment);

      const result = await paymentsService.getPaymentStatus('transaction-ref');

      expect(mockPaymentsRepository.findOne).toHaveBeenCalledWith({
        where: { transactionRef: 'transaction-ref' },
      });
      expect(result).toEqual({ status: PaymentStatus.SUCCESSFUL });
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(
        paymentsService.getPaymentStatus('non-existent-ref'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
