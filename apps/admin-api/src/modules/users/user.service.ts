import { BaseService, Injectable } from '@joktec/core';
import { User } from './models';
import { UserRepo } from './user.repo';

@Injectable()
export class UserService extends BaseService<User, string> {
  constructor(protected userRepo: UserRepo) {
    super(userRepo);
  }
}
