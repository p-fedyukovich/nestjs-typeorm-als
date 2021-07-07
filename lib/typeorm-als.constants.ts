import { Propagation } from './typeorm-als.enums';

export const ASYNC_STORAGE = Symbol('async_storage');

export const ENTITY_MANAGER = 'entity_manager';

export const DEFAULT_OPTIONS = {
  propagation: Propagation.REQUIRED,
};
