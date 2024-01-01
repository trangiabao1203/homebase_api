import { AssetRepo } from '../modules/assets';
import { OtpRepo } from '../modules/otpLogs';
import { ProductRepo } from '../modules/products';
import { SessionRepo } from '../modules/sessions';
import { UserRepo } from '../modules/users';

export const Repositories = [AssetRepo, OtpRepo, SessionRepo, UserRepo, ProductRepo];

export * from './repository.module';
