import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { TransactionInterceptor } from './transaction.interceptor';
import { TransactionalOptions } from './typeorm-als.interfaces';
import { TRANSACTIONAL_OPTIONS } from './typeorm-als.constants';

export function RequestTransaction(options?: TransactionalOptions) {
  return applyDecorators(
    SetMetadata(TRANSACTIONAL_OPTIONS, options),
    UseInterceptors(TransactionInterceptor),
  );
}
