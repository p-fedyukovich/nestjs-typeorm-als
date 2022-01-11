import { Propagation } from './typeorm-als.enums';

export const ASYNC_STORAGE = Symbol('async_storage');
export const TYPEORM_ALS_MODULE_OPTIONS = Symbol('typeorm_als_module_options');

export const ENTITY_MANAGER = 'entity_manager';

export const TRANSACTIONAL_OPTIONS = 'transactional_options';

export const DEFAULT_OPTIONS = {
  propagation: Propagation.REQUIRED,
};

export const TYPEORM_ALS_MODULE_DEFAULT_OPTIONS = {
  throwException: true,
};
