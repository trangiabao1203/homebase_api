import { ExpressRequest, ExpressResponse } from '@joktec/core';
import { User } from '../../modules/users';

export type Request<T extends object = any> = ExpressRequest<T, User>;
export type Response<T extends object = any> = ExpressResponse<T>;
export * from './base.response.dto';
export * from './address';
export * from './gravatar';
export * from './location';
