import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { from, Observable, throwError } from 'rxjs';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ModuleRef, Reflector } from '@nestjs/core';
import { ASYNC_STORAGE, TRANSACTIONAL_OPTIONS } from './typeorm-als.constants';
import {
  catchError,
  finalize,
  mapTo,
  mergeMap,
  mergeMapTo,
} from 'rxjs/operators';
import { AsyncLocalStorage } from 'async_hooks';
import { deleteEntityManager, setEntityManager } from './typeorm-als.utils';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    @Inject(ASYNC_STORAGE)
    private readonly asyncStorage: AsyncLocalStorage<Map<string, any>>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const options = this.reflector.get(
      TRANSACTIONAL_OPTIONS,
      context.getHandler(),
    );
    const dataSourceToken = getDataSourceToken(options?.connection) as string;
    const dataSource = await this.moduleRef.get<DataSource>(dataSourceToken, {
      strict: false,
    });
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(options?.isolation);

    const store = this.asyncStorage.getStore();
    setEntityManager(store, options, queryRunner.manager);

    return next.handle().pipe(
      mergeMap((res) => {
        return from(queryRunner.commitTransaction()).pipe(mapTo(res));
      }),
      catchError((err) => {
        return from(queryRunner.rollbackTransaction()).pipe(
          mergeMapTo(throwError(err)),
        );
      }),
      finalize(() => {
        deleteEntityManager(store, options);
        return from(queryRunner.release());
      }),
    );
  }
}
