import {
  BadRequestException,
  ConfigService,
  DeepPartial,
  ForbiddenException,
  generateOTP,
  generateUUID,
  hashPassword,
  Inject,
  Injectable,
  isStrongPassword,
  IUserAgent,
  JwtService,
  matchPassword,
  NotFoundException,
  REQUEST,
  ValidationException,
  ValidatorBuilder,
} from '@joktec/core';
import { omit } from 'lodash';
import moment from 'moment';
import { Gravatar, Request } from '../../base';
import { PASSWORD_OPTIONS } from '../../utils';
import { Otp, OtpService, OTPStatus, OTPType } from '../otpLogs';
import { SessionService, SessionStatus, SessionType } from '../sessions';
import { User, UserService, UserStatus, UserUtils } from '../users';
import { AuthConfig } from './auth.config';
import { LoginDto, RefreshTokenDto, RegisterDto, ResetDto, SendOtpDto, TokeResponseDto, VerifyOtpDto } from './models';

@Injectable()
export class AuthService {
  private readonly authCfg: AuthConfig;

  constructor(
    @Inject(REQUEST) private request: Request,
    private config: ConfigService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private sessionService: SessionService,
    private userService: UserService,
    private userUtils: UserUtils,
  ) {
    this.authCfg = this.config.parse(AuthConfig, 'guard');
  }

  async send(input: SendOtpDto): Promise<Otp> {
    const [otpList, user] = await Promise.all([
      this.otpService.findLastOtpByPhone(input.phone, input.type),
      this.userService.findOne({ phone: input.phone }),
    ]);

    if (user && input.type === OTPType.REGISTER) throw new BadRequestException('PHONE_REGISTERED');
    if ([OTPType.LOGIN, OTPType.RESET].indexOf(input.type) >= 0) {
      if (!user) throw new NotFoundException('USER_NOT_FOUND');
      if (user.status === UserStatus.DISABLED) {
        throw new ForbiddenException('USER_DISABLED');
      }
    }

    // 1. First send
    if (!otpList.length) {
      return this.otpService.create({
        phone: input.phone,
        publicCode: this.authCfg.skipOtp ? '000000' : generateOTP(6),
        privateCode: generateUUID(),
        type: input.type,
        retry: 1,
        expiredInSeconds: this.authCfg.pending,
        expired: moment().startOf('ms').add(this.authCfg.pending, 'second').toDate(),
        status: OTPStatus.ACTIVATED,
      });
    }

    // 2. Check the last otp is expired, then restrict or retry
    const lastOTP: Otp = otpList[0];
    const now = moment().startOf('ms');
    const expired = moment(lastOTP.expired).startOf('ms');
    if (expired <= now) {
      // 2.1. Restrict the number of send OTP
      if (otpList.length >= this.authCfg.limit) {
        await this.otpService.update(lastOTP._id, { status: OTPStatus.EXPIRED });
        throw new BadRequestException('RESTRICT_SEND_OTP');
      }

      // 2.2 Retry send OTP
      const retry: number = lastOTP.retry + 1;
      const expiredInSeconds: number = retry * this.authCfg.pending;
      await this.otpService.update(lastOTP._id, { status: OTPStatus.EXPIRED });
      return this.otpService.create({
        phone: lastOTP.phone,
        email: lastOTP.email,
        publicCode: this.authCfg.skipOtp ? '000000' : generateOTP(6),
        privateCode: generateUUID(),
        type: input.type,
        retry,
        expiredInSeconds,
        expired: moment().startOf('ms').add(expiredInSeconds, 'second').toDate(),
        status: OTPStatus.ACTIVATED,
      });
    }

    // 3. Still available but reject send otp
    if (expired > now) {
      const duration = moment.duration(now.diff(expired));
      const seconds: number = Math.abs(duration.asSeconds());
      throw new BadRequestException('OTP_PENDING', { expiredInSeconds: seconds });
    }
  }

  async verifyOtp(input: VerifyOtpDto): Promise<Otp> {
    const otp: Otp = await this.otpService.findOne({ privateCode: input.privateCode });
    if (!otp || otp.publicCode !== input.publicCode || otp.status !== OTPStatus.ACTIVATED) {
      throw new BadRequestException('PUBLIC_CODE_INVALID_OR_EXPIRED');
    }

    const now = moment().startOf('ms');
    const expired = moment(otp.expired).startOf('ms');
    if (now >= expired) {
      await this.otpService.update(otp._id, { status: OTPStatus.EXPIRED });
      throw new BadRequestException('PUBLIC_CODE_INVALID_OR_EXPIRED');
    }

    return this.otpService.update(otp._id, {
      activeCode: generateUUID(),
      status: OTPStatus.VERIFIED,
    });
  }

  async register(input: RegisterDto): Promise<TokeResponseDto> {
    const otp = await this.otpService.findOne({ activeCode: input.activeCode });
    if (!otp || otp?.status !== OTPStatus.VERIFIED) throw new BadRequestException('SESSION_INVALID');
    if (otp.phone !== input.phone) throw new ValidationException({ path: 'phone', message: 'PHONE_NOT_MATCH' });

    const builder = ValidatorBuilder.init();
    if (!input.password) builder.add('password', 'PASSWORD_REQUIRED');
    if (!isStrongPassword(input.password, PASSWORD_OPTIONS)) builder.add('password', 'PASSWORD_WEEK');
    if (!input.confirmedPassword) builder.add('confirmedPassword', 'CONFIRMED_PASSWORD_REQUIRED');
    if (input.password !== input.confirmedPassword) builder.add('confirmedPassword', 'CONFIRMED_PASSWORD_NOT_MATCH');
    builder.throw();
    const inputHashPassword = hashPassword(input.password);

    const email = input.email || otp.email;
    const gravatar: Gravatar = await this.userUtils.getGravatar(email);
    const phone = input.phone || otp.phone;
    const user = await this.userService.create({
      fullName: input.fullName || gravatar?.fullName || otp.phone,
      phone,
      email,
      hashPassword: inputHashPassword,
      status: UserStatus.ACTIVATED,
      image: input.image || gravatar?.photoUrl,
      thumbnail: input.thumbnail || gravatar?.thumbnailUrl,
    });

    await this.otpService.update(otp._id, { status: OTPStatus.SUCCESS });
    return this.createTokenAndUpdate(user, SessionType.REGISTER);
  }

  async login(input: LoginDto): Promise<TokeResponseDto> {
    const user = await this.userService.findOne({ phone: input.phone });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (!user.hashPassword) throw new ValidationException({ path: 'password', message: 'PASSWORD_NOT_SETUP' });
    if (!matchPassword(input.password, user.hashPassword)) {
      throw new ValidationException({ path: 'password', message: 'PASSWORD_INVALID' });
    }
    if (user.status === UserStatus.DISABLED) throw new ForbiddenException('USER_DISABLED');
    return this.createTokenAndUpdate(user, SessionType.PASSWORD);
  }

  async reset(input: ResetDto): Promise<TokeResponseDto> {
    const [otp, user] = await Promise.all([
      this.otpService.findOne({ activeCode: input.activeCode }),
      this.userService.findOne({ phone: input.phone }),
    ]);

    if (!otp || otp?.status !== OTPStatus.VERIFIED) throw new BadRequestException('SESSION_INVALID');
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (user.status === UserStatus.DISABLED) throw new ForbiddenException('USER_DISABLED');

    const validateBuilder = ValidatorBuilder.init();
    if (otp.phone !== user.phone) validateBuilder.add('phone', 'PHONE_NOT_MATCH');
    if (!input.password) validateBuilder.add('password', 'PASSWORD_REQUIRED');
    if (!isStrongPassword(input.password, PASSWORD_OPTIONS)) validateBuilder.add('password', 'PASSWORD_WEEK');
    if (!input.confirmedPassword) validateBuilder.add('confirmedPassword', 'CONFIRMED_PASSWORD_REQUIRED');
    if (input.password !== input.confirmedPassword)
      validateBuilder.add('confirmedPassword', 'CONFIRMED_PASSWORD_NOT_MATCH');
    validateBuilder.throw();

    await this.userService.update(user._id, { hashPassword: hashPassword(input.password) });
    return this.createTokenAndUpdate(user, SessionType.RESET);
  }

  async refresh(input: RefreshTokenDto): Promise<TokeResponseDto> {
    const [acTokenDecode, rfTokenDecode] = await Promise.all([
      this.jwtService.decode(input.accessToken),
      this.jwtService.verifyRefreshToken(input.refreshToken),
    ]);

    if (acTokenDecode.sub !== rfTokenDecode.sub && acTokenDecode.jti !== rfTokenDecode.jti) {
      throw new BadRequestException('TOKEN_NOT_MATCH');
    }

    const [user, session] = await Promise.all([
      this.userService.findById(rfTokenDecode.sub),
      this.sessionService.findOne({ tokenId: rfTokenDecode.jti }),
    ]);
    if (!session) throw new BadRequestException('SESSION_NOT_FOUND');
    if (session.revokedAt || session.status === SessionStatus.DISABLED) throw new BadRequestException('TOKEN_REVOKED');
    if (user._id !== session.userId) throw new BadRequestException('TOKEN_OWNER_INVALID');

    await this.sessionService.update(session._id, { status: SessionStatus.DISABLED, revokedAt: new Date() });
    return this.createTokenAndUpdate(user, SessionType.REFRESH);
  }

  async revokeSession(tokenId: string): Promise<boolean> {
    try {
      await this.sessionService.revoke(tokenId);
      return true;
    } catch (err) {
      return false;
    }
  }

  private async createTokenAndUpdate(user: User, sessionType: SessionType): Promise<TokeResponseDto> {
    const ua: IUserAgent = this.request.userAgent;
    const tokenId = generateUUID();
    const token = await this.jwtService.sign({
      sub: user._id,
      jti: tokenId,
      userId: user._id,
      phone: user.phone,
      email: user.email,
    });
    await this.sessionService.create({
      tokenId,
      type: sessionType,
      expiresAt: token.expiredAt,
      status: SessionStatus.ACTIVATED,
      userId: user._id,
      createdBy: user._id,
      updatedBy: user._id,
      ipAddress: this.request.geoIp?.ipAddress,
      geoIp: omit(this.request.geoIp, ['ipAddress']),
      userAgent: ua.ua,
      os: ua.os,
      browser: ua.browser,
      device: ua.device,
      cpu: ua.cpu,
      engine: ua.engine,
    });

    const body: DeepPartial<User> = { updatedBy: user._id };
    if (!String(user.createdBy)) body.createdBy = user._id;

    const profile = await this.userService.update(user._id, body);
    return { ...token, profile };
  }
}
