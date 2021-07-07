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

import { ASYNC_STORAGE } from './typeorm-als.constants';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Connection, Repository } from 'typeorm';
import { getEntityManager } from './typeorm-als.utils';

@Global()
@Module({})
export class TypeOrmAlsModule implements OnModuleInit, NestModule {
  static forRoot(): DynamicModule {
    const asyncLocalStorage = this.createALS();

    const alsProvider = {
      provide: ASYNC_STORAGE,
      useValue: asyncLocalStorage,
    };

    return {
      module: TypeOrmAlsModule,
      imports: [DiscoveryModule],
      providers: [alsProvider, DiscoveryService],
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
      if (instance instanceof Repository) {
        const asyncStorage = this.asyncStorage;
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
