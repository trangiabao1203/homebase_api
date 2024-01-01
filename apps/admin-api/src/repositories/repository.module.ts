import { Global, Module } from '@joktec/core';
import { Repositories } from './index';

@Global()
@Module({
  imports: [],
  providers: [...Repositories],
  exports: [...Repositories],
})
export class RepositoryModule {}
