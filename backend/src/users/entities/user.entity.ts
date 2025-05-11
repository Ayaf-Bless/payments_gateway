import { Payment } from '@app/payments/entities/payment.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  currency: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Column({ length: 10, unique: true })
  accountNumber: string;

  @OneToMany(() => Payment, (payment) => payment.payerUser)
  sentPayments: Payment[];

  @OneToMany(() => Payment, (payment) => payment.payeeUser)
  receivedPayments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
