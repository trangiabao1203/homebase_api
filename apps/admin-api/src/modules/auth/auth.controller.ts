import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
  BaseValidationPipe,
  Body,
  Controller,
  GatewayMetric,
  Get,
  Post,
  QueryParam,
  Render,
  ResponseInterceptor,
  UseInterceptors,
  UsePipes,
} from '@joktec/core';
import { Otp, OTPStatus } from '../otpLogs';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetDto,
  SendOtpDto,
  SendOtpResponse,
  TokeResponseDto,
  VerifyOtpDto,
  VerifyOtpResponse,
} from './models';

@Controller('auth')
@ApiTags('auth')
@UsePipes(new BaseValidationPipe())
@UseInterceptors(GatewayMetric, ResponseInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/send')
  @ApiBody({ type: SendOtpDto })
  @ApiOkResponse({ type: SendOtpResponse })
  async sendOTP(@Body() input: SendOtpDto): Promise<SendOtpResponse> {
    const otp: Otp = await this.authService.send(input);
    if (otp.publicCode === '000000') {
      const verifyOtp = await this.authService.verifyOtp({ publicCode: otp.publicCode, privateCode: otp.privateCode });
      return { activeCode: verifyOtp.activeCode };
    }

    if (otp.status === OTPStatus.ACTIVATED && otp.publicCode !== '000000') {
      // TODO: Implement send OTP in here
      // const msg = `Ma xac thuc cua ban la: ${otp.publicCode}`;
      // await this.smsService.send(otp.phone, msg);
    }

    return {
      publicCode: otp.publicCode,
      privateCode: otp.privateCode,
      retry: otp.retry,
      expiredInSeconds: otp.expiredInSeconds,
    };
  }

  @Post('/verify')
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ type: VerifyOtpResponse })
  @ApiExcludeEndpoint()
  async verifyOTP(@Body() input: VerifyOtpDto): Promise<VerifyOtpResponse> {
    const otp: Otp = await this.authService.verifyOtp(input);
    return { activeCode: otp.activeCode };
  }

  @Post('/register')
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: TokeResponseDto })
  async register(@Body() input: RegisterDto): Promise<TokeResponseDto> {
    return this.authService.register(input);
  }

  @Post('/login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokeResponseDto })
  async login(@Body() input: LoginDto): Promise<TokeResponseDto> {
    return this.authService.login(input);
  }

  @Post('/reset')
  @ApiBody({ type: ResetDto })
  @ApiOkResponse({ type: TokeResponseDto })
  async reset(@Body() input: ResetDto): Promise<TokeResponseDto> {
    return this.authService.reset(input);
  }

  @Post('/refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: TokeResponseDto })
  @ApiExcludeEndpoint()
  async refresh(@Body() input: RefreshTokenDto): Promise<TokeResponseDto> {
    return this.authService.refresh(input);
  }

  @Get('/revoke')
  @Render('verify-success')
  @ApiExcludeEndpoint()
  async revoke(@QueryParam('tokenId') tokenId: string) {
    const success = await this.authService.revokeSession(tokenId);
    return { success };
  }
}
