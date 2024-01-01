import {
  hashPassword,
  Inject,
  Injectable,
  isStrongPassword,
  LogService,
  matchPassword,
  REQUEST,
  ValidationException,
  ValidatorBuilder,
} from '@joktec/core';
import { BaseResponseDto, Request } from '../../base';
import { PASSWORD_OPTIONS } from '../../utils';
import { SessionService, SessionStatus } from '../sessions';
import { UserService } from '../users';
import { UserFcmDto, UserPasswordDto, UserProfile, UserProfileDto } from './models';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private logger: LogService,
    private userService: UserService,
    private sessionService: SessionService,
  ) {
    this.logger.setContext(ProfileService.name);
  }

  async getProfile(): Promise<UserProfile> {
    const payload = this.request.payload;
    return this.userService.findById(payload.sub);
  }

  async updateProfile(input: UserProfileDto): Promise<UserProfile> {
    const payload = this.request.payload;
    const user = await this.userService.findById(payload.sub);
    if (input.email && user.email !== input.email) {
      throw new ValidationException({ path: 'email', message: 'CANNOT_CHANGE_EMAIL' });
    }
    return await this.userService.update(payload.sub, input, payload);
  }

  async changePassword(input: UserPasswordDto): Promise<UserProfile> {
    const payload = this.request.payload;
    const user = await this.userService.findById(payload.sub);

    const builder = ValidatorBuilder.init();
    if (!matchPassword(input.oldPassword, user.hashPassword)) builder.add('oldPassword', 'OLD_PASSWORD_NOT_MATCH');
    if (input.password === input.oldPassword) builder.add('password', 'DUPLICATE_OLD_PASSWORD');
    if (!isStrongPassword(input.password, PASSWORD_OPTIONS)) builder.add('password', 'PASSWORD_WEEK');
    if (!input.confirmedPassword) builder.add('confirmedPassword', 'CONFIRMED_PASSWORD_REQUIRED');
    if (input.password !== input.confirmedPassword) builder.add('confirmedPassword', 'CONFIRMED_PASSWORD_NOT_MATCH');
    builder.throw();

    return this.userService.update(user._id, { hashPassword: hashPassword(input.password) });
  }

  async updateRegistrationID(input: UserFcmDto): Promise<UserProfile> {
    const payload = this.request.payload;
    const [user, session] = await Promise.all([
      this.userService.findById(payload.sub),
      this.sessionService.findOne({ tokenId: payload.jti }),
    ]);
    await this.sessionService.update(session._id, { registrationId: input.registrationId });
    return user;
  }

  async revokedMe(): Promise<BaseResponseDto> {
    const payload = this.request.payload;
    const session = await this.sessionService.findOne({ tokenId: payload.jti });
    if (session) {
      await this.sessionService.update(session._id, { status: SessionStatus.DISABLED, revokedAt: new Date() });
    }
    return { success: true };
  }

  async revokedOther(tokenIds: string[]): Promise<BaseResponseDto> {
    const payload = this.request.payload;
    const filterTokens = tokenIds.filter(jti => jti !== payload.jti);
    const sessions = await this.sessionService.find({ condition: { tokenId: { $in: filterTokens } } });
    if (sessions.length) {
      await Promise.all(
        sessions.map(s => this.sessionService.update(s._id, { status: SessionStatus.DISABLED, revokedAt: new Date() })),
      );
    }
    return { success: true };
  }
}
