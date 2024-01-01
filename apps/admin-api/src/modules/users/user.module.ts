import { Module } from '@joktec/core';
import { UserInterceptor } from './hooks';
import { UserController } from './user.controller';
import { UserRepo } from './user.repo';
import { UserService } from './user.service';
import { UserUtils } from './user.utils';

@Module({
  controllers: [UserController],
  providers: [UserRepo, UserService, UserUtils, UserInterceptor],
  exports: [UserService, UserUtils],
})
export class UserModule {}
