import {
  DynamicModule,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  NestModule,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';

import {
  ASYNC_STORAGE,
  TYPE_ORM_ALS_MODULE_OPTIONS,
} from './typeorm-als.constants';
import { getEntityManager, getQueryRunner } from './typeorm-als.utils';
import { TypeOrmAlsModuleOptions } from './typeorm-als.interfaces';

@Global()
@Module({})
export class TypeOrmAlsModule implements OnModuleInit, NestModule {
  static forRoot(options?: TypeOrmAlsModuleOptions): DynamicModule {
    const asyncLocalStorage = this.createALS();

    const alsProvider = {
      provide: ASYNC_STORAGE,
      useValue: asyncLocalStorage,
    };

    const optionsProvider = {
      provide: TYPE_ORM_ALS_MODULE_OPTIONS,
      useValue: options || {},
    };

    return {
      module: TypeOrmAlsModule,
      imports: [DiscoveryModule],
      providers: [alsProvider, optionsProvider, DiscoveryService],
      exports: [alsProvider],
    };
  }

  private static createALS(): AsyncLocalStorage<Map<string, any>> {
    return new AsyncLocalStorage();
  }

  constructor(
    @Inject(ASYNC_STORAGE)
    private readonly asyncStorage: AsyncLocalStorage<Map<string, any>>,
    @Inject(TYPE_ORM_ALS_MODULE_OPTIONS)
    private readonly options: TypeOrmAlsModuleOptions,
    private readonly discovery: DiscoveryService,
  ) {}

  onModuleInit(): any {
    const wrappers = this.discovery.getProviders();

    wrappers.forEach((wrapper) => {
      const instance = wrapper.instance;
      const asyncStorage = this.asyncStorage;

      if (instance instanceof Repository) {
        Object.assign(instance, { _manager: instance.manager });
        Object.defineProperty(instance, 'manager', {
          get() {
            const store = asyncStorage.getStore();

            if (store) {
              const entityManager = getEntityManager(
                store,
                this._manager.connection,
              );

              if (entityManager) {
                return entityManager;
              }
            }

            return this._manager;
          },
        });
      } else if (instance instanceof DataSource) {
        const original = instance.createQueryBuilder.bind(instance);

        Reflect.defineProperty(DataSource.prototype, 'createQueryBuilder', {
          value: function <Entity>(...args: any[]) {
            if (args.length === 1 || args.length === 3) {
              return original(...args);
            }

            const store = asyncStorage.getStore();
            let existingQueryRunner: QueryRunner;

            if (store) {
              existingQueryRunner = getQueryRunner(store, instance);
              if (existingQueryRunner) {
                if (args.length === 0) {
                  return original(existingQueryRunner);
                }

                return original(args[0], args[1], existingQueryRunner);
              }
            }

            return original(...args);
          },
        });
      }
    });
  }

  configure(consumer: MiddlewareConsumer): any {
    const middleware = (req: any, res: any, next: () => void) => {
      let store = this.asyncStorage.getStore();
      if (!store) {
        store = new Map();

        this.asyncStorage.run(store, () => {
          next();
        });
      }
    };

    let middlewareConfigProxy = consumer.apply(middleware);
    if (this.options && this.options.exclude) {
      middlewareConfigProxy = middlewareConfigProxy.exclude(
        ...this.options.exclude,
      );
    }
    middlewareConfigProxy.forRoutes('*');
  }
}
