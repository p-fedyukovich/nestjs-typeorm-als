import { Connection, ConnectionOptions } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

import { IsolationLevel, Propagation } from './typeorm-als.enums';

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
}
