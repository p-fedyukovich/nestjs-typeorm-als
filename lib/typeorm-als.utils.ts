import { ENTITY_MANAGER } from './typeorm-als.constants';
import { Connection, ConnectionOptions, EntityManager } from 'typeorm';
import { getConnectionPrefix } from '@nestjs/typeorm';

function getEntityManagerKey(
  connection: Connection | ConnectionOptions | string,
): string {
  return getConnectionPrefix(connection) + ENTITY_MANAGER;
}

export function getEntityManager(
  store: Map<string, any>,
  connection: Connection | ConnectionOptions | string,
): EntityManager | null {
  const manager = store.get(getEntityManagerKey(connection));
  if (!manager) {
    return null;
  }
  return manager;
}

export function setEntityManager(
  store: Map<string, any>,
  connection: Connection | ConnectionOptions | string,
  entityManager: EntityManager,
): void {
  store.set(getEntityManagerKey(connection), entityManager);
}

export function deleteEntityManager(
  store: Map<string, any>,
  connection: Connection | ConnectionOptions | string,
): void {
  store.delete(getEntityManagerKey(connection));
}
