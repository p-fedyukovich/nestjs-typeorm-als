import { Test } from '@nestjs/testing';
import * as Sinon from 'sinon';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/users/user.service';
import { User } from '../src/entity/user.entity';
import { Purse } from '../src/entity/purse.entity';
import { Remittance } from '../src/entity/remittance.entity';

jest.setTimeout(500 * 1000);

describe('TypeOrm session', () => {
  let app: INestApplication;
  let server;
  let sandbox: Sinon.SinonSandbox;
  let dataSourceSpy: Sinon.SinonSpiedInstance<DataSource>;
  let userRepository: Repository<User>;
  let purseRepository: Repository<Purse>;
  let remittanceRepository: Repository<Remittance>;
  let userService: UserService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    server = app.getHttpAdapter().getInstance();

    sandbox = Sinon.createSandbox();

    await app.init();

    dataSource = app.get(DataSource);

    dataSourceSpy = sandbox.spy(dataSource);

    userRepository = dataSource.getRepository(User);
    purseRepository = dataSource.getRepository(Purse);
    remittanceRepository = dataSource.getRepository(Remittance);
    userService = app.get(UserService);
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
      expect(dataSourceSpy.createQueryRunner.calledOnce).toBeTruthy();
      const queryRunner =
        dataSourceSpy.createQueryRunner.getCall(0).returnValue;

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
        dataSourceSpy.createQueryRunner.getCall(0).returnValue;

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
        expect(dataSourceSpy.createQueryRunner.calledOnce).toBeTruthy();
        const queryRunner =
          dataSourceSpy.createQueryRunner.getCall(0).returnValue;

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

  describe('transactional decorator', () => {
    it('should create an user using request', async () => {
      const res = await request(server)
        .post('/transactional')
        .send({ name: 'Pavel' });
      expect(dataSourceSpy.createQueryRunner.calledOnce).toBeTruthy();
      const queryRunner =
        dataSourceSpy.createQueryRunner.getCall(0).returnValue;

      expect(queryRunner.isTransactionActive).toBeFalsy();
      expect(queryRunner.isReleased).toBeTruthy();
      expect(res).toMatchObject({
        statusCode: 201,
        body: {
          name: 'Pavel',
        },
      });
    });

    it('should create an user via service', async () => {
      const user = await userService.createAndGet({ name: 'Petr' });
      expect(dataSourceSpy.createQueryRunner.calledOnce).toBeTruthy();
      const queryRunner =
        dataSourceSpy.createQueryRunner.getCall(0).returnValue;

      expect(queryRunner.isTransactionActive).toBeFalsy();
      expect(queryRunner.isReleased).toBeTruthy();
      expect(user).toMatchObject({
        name: 'Petr',
      });
    });
  });
});
