import { DataSource, DataSourceOptions } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

import { IsolationLevel, Propagation } from './typeorm-als.enums';
import { RouteInfo } from '@nestjs/common/interfaces/middleware/middleware-configuration.interface';

export interface TransactionalOptions {
  dataSource?: DataSource | DataSourceOptions | string;
  /**
   * The transaction isolation level.
   */
  isolation?: IsolationLevel;

  /**
   * The transaction propagation type.
   */
  propagation?: Propagation;
}

export interface TypeOrmAlsModuleOptions {
  exclude?: (string | RouteInfo)[];
}

export interface Connectable {
  dataSource: DataSource;
  storage: AsyncLocalStorage<Map<string, any>>;
}
