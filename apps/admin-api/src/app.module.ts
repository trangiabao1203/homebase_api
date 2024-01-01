import {
  APP_FILTER,
  APP_INTERCEPTOR,
  CoreModule,
  GatewayExceptionsFilter,
  JwtModule,
  Module,
  ResponseInterceptor,
} from '@joktec/core';
import { MongoModule } from '@joktec/mongo';
import { StorageModule } from '@joktec/storage';
import { MainModule } from './modules/main.module';
import { RepositoryModule } from './repositories';

@Module({
  imports: [CoreModule, MongoModule, StorageModule, JwtModule, RepositoryModule, MainModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GatewayExceptionsFilter },
  ],
})
export class AppModule {}
