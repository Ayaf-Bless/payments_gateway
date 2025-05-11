import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('/auth/register (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      authToken = response.body.accessToken;
    });

    it('/auth/login (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('Payments', () => {
    it('/payments (POST) - unauthorized', async () => {
      return request(app.getHttpServer())
        .post('/payments')
        .send({
          payer: '0712345678',
          payee: '0787654321',
          amount: 100.5,
          currency: 'UGX',
        })
        .expect(401);
    });

    it('/payments (POST) - authorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          payer: '0712345678',
          payee: '0787654321',
          amount: 100.5,
          currency: 'UGX',
        })
        .expect(201);

      expect(response.body).toHaveProperty('transactionRef');

      // Test payment status endpoint
      const transactionRef = response.body.transactionRef;

      return request(app.getHttpServer())
        .get(`/payments/${transactionRef}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status');
        });
    });

    it('/payments/:ref (GET) - not found', async () => {
      return request(app.getHttpServer())
        .get('/payments/non-existent-ref')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
