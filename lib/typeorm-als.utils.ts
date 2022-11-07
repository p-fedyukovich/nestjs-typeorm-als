import { ENTITY_MANAGER } from './typeorm-als.constants';
import {
  DataSource,
  DataSourceOptions,
  EntityManager,
  QueryRunner,
} from 'typeorm';
import { getDataSourcePrefix } from '@nestjs/typeorm';

function getDatasourceKey(
  dataSource: DataSource | DataSourceOptions | string,
): string {
  return getDataSourcePrefix(dataSource) + ENTITY_MANAGER;
}

export function getQueryRunner(
  store: Map<string, any>,
  dataSource: DataSource | DataSourceOptions | string,
): QueryRunner | null {
  const entityManager = getEntityManager(store, dataSource);

  if (entityManager) {
    const { queryRunner } = entityManager;
    if (queryRunner) {
      return queryRunner;
    }
  }

  return null;
}

export function getEntityManager(
  store: Map<string, any>,
  dataSource: DataSource | DataSourceOptions | string,
): EntityManager | null {
  const manager = store.get(getDatasourceKey(dataSource));
  if (!manager) {
    return null;
  }
  return manager;
}

export function setEntityManager(
  store: Map<string, any>,
  dataSource: DataSource | DataSourceOptions | string,
  entityManager: EntityManager,
): void {
  store.set(getDatasourceKey(dataSource), entityManager);
}

export function deleteEntityManager(
  store: Map<string, any>,
  dataSource: DataSource | DataSourceOptions | string,
): void {
  store.delete(getDatasourceKey(dataSource));
}
