import { Connection, ConnectionOptions } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

import { IsolationLevel, Propagation } from './typeorm-als.enums';
import { ModuleMetadata } from '@nestjs/common';

export interface TransactionalOptions {
  connection?: Connection | ConnectionOptions | string;
  /**
   * The transaction isolation level.
   */
  isolation?: IsolationLevel;

  /**
   * The transaction propagation type.
   */
  propagation?: Propagation;
}

export interface Connectable {
  connection: Connection;
  storage: AsyncLocalStorage<Map<string, any>>;
  typeOrmAlsModuleOptions: TypeOrmAlsModuleOptions;
}

export interface TypeOrmAlsModuleOptions {
  throwException: boolean;
}

export interface TypeOrmAlsAsyncModuleOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (
    ...args: any[]
  ) => TypeOrmAlsModuleOptions | Promise<TypeOrmAlsModuleOptions>;
  inject?: any[];
}
