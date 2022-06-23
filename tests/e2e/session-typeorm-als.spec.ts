import { Test } from '@nestjs/testing';
import * as Sinon from 'sinon';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../src/users/user.repository';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { PurseRepository } from '../src/purse/purse.repository';
import { RemittanceRepository } from '../src/remittance/remittance.repository';

jest.setTimeout(500 * 1000);

describe('TypeOrm session', () => {
  let app: INestApplication;
  let server;
  let sandbox: Sinon.SinonSandbox;
  let connectionSpy: Sinon.SinonSpiedInstance<Connection>;
  let userRepository: UserRepository;
  let purseRepository: PurseRepository;
  let remittanceRepository: RemittanceRepository;
  let connection: Connection;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    server = app.getHttpAdapter().getInstance();

    sandbox = Sinon.createSandbox();

    await app.init();

    connection = app.get(Connection);

    connectionSpy = sandbox.spy(connection);

    userRepository = app.get(UserRepository);
    purseRepository = app.get(PurseRepository);
    remittanceRepository = app.get(RemittanceRepository);
  });

  afterAll(async () => {
    await app.close();
    sandbox.restore();
  });

  afterEach(async () => {
    await userRepository.delete({});
    await purseRepository.delete({});
    await remittanceRepository.delete({});
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

  describe('query builder', () => {
    describe('when request is ok', () => {
      it('should create an user', async () => {
        const res = await request(server)
          .post('/builder')
          .send({ name: 'Pavel' });
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
  });
});
