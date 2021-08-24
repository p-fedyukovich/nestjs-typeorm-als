import { Test } from '@nestjs/testing';
import * as Sinon from 'sinon';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { User } from '../src/user.entity';
import { TypeormAlsController } from '../src/typeorm-als.controller';
import { TypeOrmAlsModule } from '../../lib';
import { UserRepository } from '../src/user.repository';
import { Connection } from 'typeorm';

describe('TypeOrm session', () => {
  let app: INestApplication;
  let server;
  let sandbox: Sinon.SinonSandbox;
  let connectionSpy: Sinon.SinonSpiedInstance<Connection>;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
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

    sandbox = Sinon.createSandbox();

    await app.init();

    const connection = app.get(Connection);

    userRepository = app.get(UserRepository);

    connectionSpy = sandbox.spy(connection);
  });

  afterAll(async () => {
    await app.close();
    sandbox.restore();
  });

  afterEach(async () => {
    await userRepository.delete({});
    sandbox.reset();
  });

  describe('when request is ok', () => {
    it('should create an user', async () => {
      const res = await request(server).post('/').send({ name: 'Pavel' });
      expect(connectionSpy.createQueryRunner.calledOnce).toBeTruthy();
      const queryRunner =
        connectionSpy.createQueryRunner.getCall(0).returnValue;

      expect(queryRunner.isTransactionActive).toBeFalsy();
      expect(queryRunner.isReleased).toBeTruthy();
      expect(res).toMatchObject({
        statusCode: 201,
        body: {
          name: 'Pavel',
        },
      });
    });
  });

  describe('when error is thrown', () => {
    it('should rollback and return 500', async () => {
      const res = await request(server).get('/').send();
      const queryRunner =
        connectionSpy.createQueryRunner.getCall(0).returnValue;

      expect(queryRunner.isTransactionActive).toBeFalsy();
      expect(queryRunner.isReleased).toBeTruthy();
      expect(res).toMatchObject({
        statusCode: 500,
        body: {
          statusCode: 500,
          message: 'Internal Server Error',
          error: 'Internal Server Error',
        },
      });
    });
  });
});
