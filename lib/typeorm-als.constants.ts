import { Propagation } from './typeorm-als.enums';

export const ASYNC_STORAGE = Symbol('async_storage');

export const TYPE_ORM_ALS_MODULE_OPTIONS = Symbol(
  'type_orm_als_module_options',
);

export const ENTITY_MANAGER = 'entity_manager';

export const TRANSACTIONAL_OPTIONS = 'transactional_options';

export const DEFAULT_OPTIONS = {
  propagation: Propagation.REQUIRED,
};
