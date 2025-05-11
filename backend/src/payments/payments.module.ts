import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { UsersModule } from '@app/users/users.module';
import { RateLimitModule } from '../common/rate-limit/rate-limit.module';
import { User } from '@app/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { InMemoryCacheModule } from '@app/cache/cache.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@app/auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    UsersModule,
    InMemoryCacheModule,
    RateLimitModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, JwtStrategy],
})
export class PaymentsModule {}
