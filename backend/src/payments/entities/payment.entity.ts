import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { PaymentType } from '@app/common/enums/payment-type.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  payer: string;

  @Column({ length: 10 })
  payee: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.INCOMING,
  })
  type: PaymentType;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  payerReference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ name: 'transaction_ref', unique: true })
  transactionRef: string;

  // Main user relationship - this is the owner of the payment record
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // Payer relationship
  @ManyToOne(() => User, (user) => user.sentPayments)
  @JoinColumn({ name: 'payer_id' })
  payerUser: User;

  @Column({ name: 'payer_id' })
  payerId: string;

  // Payee relationship
  @ManyToOne(() => User, (user) => user.receivedPayments)
  @JoinColumn({ name: 'payee_id' })
  payeeUser: User;

  @Column({ name: 'payee_id' })
  payeeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
