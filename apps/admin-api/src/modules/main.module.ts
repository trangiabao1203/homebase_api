import { Module } from '@joktec/core';
import { RepositoryModule } from '../repositories';
import { AssetModule } from './assets';
import { AuthModule } from './auth';
import { OtpModule } from './otpLogs';
import { ProductModule } from './products';
import { ProfileModule } from './profile';
import { SessionModule } from './sessions';
import { UserModule } from './users';

@Module({
  imports: [
    RepositoryModule,
    UserModule,
    SessionModule,
    OtpModule,
    AuthModule,
    ProfileModule,
    ProductModule,
    AssetModule,
  ],
})
export class MainModule {}
