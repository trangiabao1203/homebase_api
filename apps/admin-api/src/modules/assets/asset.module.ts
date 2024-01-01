import { Module } from '@joktec/core';
import { AssetController } from './asset.controller';
import { AssetRepo } from './asset.repo';
import { AssetService } from './asset.service';
import { AssetUtils } from './asset.utils';

@Module({
  controllers: [AssetController],
  providers: [AssetRepo, AssetService, AssetUtils],
  exports: [AssetService, AssetUtils],
})
export class AssetModule {}
