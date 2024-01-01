import { Module } from '@joktec/core';
import { OtpService } from '../otpLogs';
import { SessionService } from '../sessions';
import { UserService, UserUtils } from '../users';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService, SessionService, UserService, UserUtils],
  exports: [AuthService],
})
export class AuthModule {}
