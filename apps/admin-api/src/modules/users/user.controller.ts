import { BaseController, Controller, IControllerProps } from '@joktec/core';
import { UserInterceptor } from './hooks';
import { User, UserDto } from './models';
import { UserService } from './user.service';

const props: IControllerProps<User> = {
  dto: User,
  customDto: { createDto: UserDto },
  hooks: {
    create: [UserInterceptor],
    update: [UserInterceptor],
  },
};

@Controller('users')
export class UserController extends BaseController<User, string>(props) {
  constructor(protected userService: UserService) {
    super(userService);
  }
}
