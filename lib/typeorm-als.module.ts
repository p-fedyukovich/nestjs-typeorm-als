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
import { Connection, EntityTarget, QueryRunner, Repository } from 'typeorm';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';

import {
  ASYNC_STORAGE,
  TYPEORM_ALS_MODULE_OPTIONS,
} from './typeorm-als.constants';
import { getEntityManager, getQueryRunner } from './typeorm-als.utils';
import {
  TypeOrmAlsAsyncModuleOptions,
  TypeOrmAlsModuleOptions,
} from './typeorm-als.interfaces';

@Global()
@Module({})
export class TypeOrmAlsModule implements OnModuleInit, NestModule {
  static forRoot(options: TypeOrmAlsModuleOptions): DynamicModule {
    const asyncLocalStorage = this.createALS();

    const alsProvider = {
      provide: ASYNC_STORAGE,
      useValue: asyncLocalStorage,
    };

    const optionsProvider = {
      provide: TYPEORM_ALS_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: TypeOrmAlsModule,
      imports: [DiscoveryModule],
      providers: [alsProvider, optionsProvider, DiscoveryService],
      exports: [alsProvider],
    };
  }

  static forRootAsync(options: TypeOrmAlsAsyncModuleOptions): DynamicModule {
    const asyncLocalStorage = this.createALS();

    const alsProvider = {
      provide: ASYNC_STORAGE,
      useValue: asyncLocalStorage,
    };

    const optionsProvider = {
      provide: TYPEORM_ALS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
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
    private readonly connection: Connection,
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
      } else if (instance instanceof Connection) {
        Object.assign(instance, {
          _createQueryBuilder: instance.createQueryBuilder,
        });

        Object.defineProperty(instance, 'createQueryBuilder', {
          configurable: true,
          value<Entity>(
            entityOrRunner?: EntityTarget<Entity> | QueryRunner,
            alias?: string,
            queryRunner?: QueryRunner,
          ) {
            const store = asyncStorage.getStore();
            let existingQueryRunner: QueryRunner;

            if (store) {
              existingQueryRunner = getQueryRunner(store, instance);
            }

            if (
              queryRunner ||
              (!alias && entityOrRunner) ||
              !existingQueryRunner
            ) {
              return this._createQueryBuilder(
                entityOrRunner,
                alias,
                queryRunner,
              );
            }

            if (!alias) {
              return this._createQueryBuilder(existingQueryRunner);
            } else {
              return this._createQueryBuilder(
                entityOrRunner,
                alias,
                existingQueryRunner,
              );
            }
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

    consumer.apply(middleware).forRoutes('*');
  }
}
