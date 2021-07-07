/**
 * Enumeration that represents transaction isolation levels for use with the {@link Transactional} annotation
 */
export enum IsolationLevel {
  /**
   * A constant indicating that dirty reads, non-repeatable reads and phantom reads can occur.
   */
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  /**
   * A constant indicating that dirty reads are prevented; non-repeatable reads and phantom reads can occur.
   */
  READ_COMMITTED = 'READ COMMITTED',
  /**
   * A constant indicating that dirty reads and non-repeatable reads are prevented; phantom reads can occur.
   */
  REPEATABLE_READ = 'REPEATABLE READ',
  /**
   * A constant indicating that dirty reads, non-repeatable reads and phantom reads are prevented.
   */
  SERIALIZABLE = 'SERIALIZABLE',
}

/**
 * Enumeration that represents transaction propagation behaviors for use with the see {@link Transactional} annotation
 */
export enum Propagation {
  /**
   * Support a current transaction, throw an exception if none exists.
   */
  MANDATORY = 'MANDATORY',
  /**
   * Execute within a nested transaction if a current transaction exists, behave like `REQUIRED` else.
   */
  NESTED = 'NESTED',
  /**
   * Execute non-transactionally, throw an exception if a transaction exists.
   */
  NEVER = 'NEVER',
  /**
   * Execute non-transactionally, suspend the current transaction if one exists.
   */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  /**
   * Support a current transaction, create a new one if none exists.
   */
  REQUIRED = 'REQUIRED',
  /**
   * Create a new transaction, and suspend the current transaction if one exists.
   */
  REQUIRES_NEW = 'REQUIRES_NEW',
  /**
   * Support a current transaction, execute non-transactionally if none exists.
   */
  SUPPORTS = 'SUPPORTS',
}
