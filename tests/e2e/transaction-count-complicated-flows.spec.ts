import { INestApplication } from '@nestjs/common';
import * as Sinon from 'sinon';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { Purse } from '../src/entity/purse.entity';
import { expectTransactionCount } from './fixtures/transaction-count-on-connection';
import { User } from '../src/entity/user.entity';
import { Remittance } from '../src/entity/remittance.entity';

describe('TypeOrm session', () => {
  let app: INestApplication;
  let server;
  let sandbox: Sinon.SinonSandbox;
  let connectionStub: Sinon.SinonStub;
  let trxs: Sinon.SinonSpy[] = [];
  let userRepository: Repository<User>;
  let purseRepository: Repository<Purse>;
  let remittanceRepository: Repository<Remittance>;
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

    userRepository = dataSource.getRepository(User);
    purseRepository = dataSource.getRepository(Purse);
    remittanceRepository = dataSource.getRepository(Remittance);
  });

  afterAll(async () => {
    await app.close();
    sandbox.restore();
  });

  beforeEach(() => {
    const original = dataSource.createQueryRunner;
    connectionStub = Sinon.stub(dataSource, 'createQueryRunner').callsFake(
      () => {
        const result = original.bind(dataSource)() as QueryRunner;
        trxs.push(Sinon.spy(result, 'startTransaction'));
        return result;
      },
    );
  });

  afterEach(async () => {
    await userRepository.delete({});
    await purseRepository.delete({});
    await remittanceRepository.delete({});
    connectionStub.restore();
    sandbox.reset();
    trxs = [];
  });

  it('should create user and purse', async () => {
    const userRes = await request(server).post('/').send({ name: 'Pavel' });
    const userId = userRes.body.id;
    const purse1 = await request(server)
      .post(`/purse/${userId}`)
      .send({ balance: 0 });

    expect(purse1.body).toMatchObject<Purse>({
      id: purse1.body.id,
      balance: 0,
      userId,
    });

    expectTransactionCount(trxs, 2);
  });

  it('should create user and two purses', async () => {
    const userRes = await request(server).post('/').send({ name: 'Pavel' });
    const userId = userRes.body.id;
    const purse1 = await request(server)
      .post(`/purse/${userId}`)
      .send({ balance: 0 });
    const purse2 = await request(server)
      .post(`/purse/${userId}`)
      .send({ balance: 0 });

    expect(purse1.body).toMatchObject<Purse>({
      id: purse1.body.id,
      balance: 0,
      userId,
    });
    expect(purse2.body).toMatchObject<Purse>({
      id: purse2.body.id,
      balance: 0,
      userId,
    });
    expectTransactionCount(trxs, 3);
  });

  it('should create user and one purse and top-up it', async () => {
    const userRes = await request(server).post('/').send({ name: 'Pavel' });
    const userId = userRes.body.id;
    const purse = await request(server)
      .post(`/purse/${userId}`)
      .send({ balance: 0 });
    const purseId = purse.body.id;
    const purseWithBalance = await request(server)
      .patch(`/purse/${purseId}/top-up`)
      .send({ sum: 100 });

    expect(purse.body).toMatchObject<Purse>({
      id: purse.body.id,
      balance: 0,
      userId,
    });
    expect(purseWithBalance.body).toMatchObject<Purse>({
      id: purseId,
      balance: 100,
      userId,
    });
    expectTransactionCount(trxs, 3);
  });

  it('should create user two users with purses and make remittance', async () => {
    const userRes1 = await request(server).post('/').send({ name: 'Pavel' });
    const userRes2 = await request(server).post('/').send({ name: 'Vasya' });
    const userId1 = userRes1.body.id;
    const userId2 = userRes2.body.id;

    let purse1 = await request(server)
      .post(`/purse/${userId1}`)
      .send({ balance: 100 });
    let purse2 = await request(server)
      .post(`/purse/${userId2}`)
      .send({ balance: 100 });
    const purse1Id = purse1.body.id;
    const purse2Id = purse2.body.id;

    await request(server).post('/remittance/remittance-with-transaction').send({
      sum: 100,
      userIdFrom: userId1,
      userIdTo: userId2,
      withError: false,
    });

    purse1 = await request(server).get(`/purse/${purse1Id}`).send();
    purse2 = await request(server).get(`/purse/${purse2Id}`).send();

    expectTransactionCount(trxs, 5);
    expect(purse1.body.balance).toEqual(0);
    expect(purse2.body.balance).toEqual(200);
  });
});
