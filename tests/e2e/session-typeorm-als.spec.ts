import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { User } from '../src/user.entity';
import { TypeormAlsController } from '../src/typeorm-als.controller';
import { TypeOrmAlsModule } from '../../lib/typeorm-als.module';
import { UserRepository } from '../src/user.repository';

describe('TypeOrm session', () => {
  let app: INestApplication;
  let server;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5440,
          username: 'postgres',
          password: 'postgres',
          entities: [User],
          synchronize: true,
          logging: 'all',
        }),
        TypeOrmModule.forFeature([UserRepository]),
        TypeOrmAlsModule.forRoot(),
      ],
      controllers: [TypeormAlsController],
    }).compile();

    app = module.createNestApplication();

    server = app.getHttpAdapter().getInstance();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an user', async () => {
    const res = await request(server).post('/').send({ name: 'Pavel' });
    expect(res.body).toMatchObject({ name: 'Pavel' });
  });
});
