import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  BaseValidationPipe,
  Body,
  Controller,
  Delete,
  GatewayMetric,
  Get,
  Put,
  ResponseInterceptor,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@joktec/core';
import { AuthGuard, BaseResponseDto } from '../../base';
import { UserFcmDto, UserPasswordDto, UserProfile, UserProfileDto, UserRevokeDto } from './models';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(GatewayMetric, ResponseInterceptor)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('/')
  @ApiOperation({ summary: `Get Profile` })
  @ApiOkResponse({ type: UserProfile })
  async getProfile(): Promise<any> {
    return this.profileService.getProfile();
  }

  @Put('/')
  @ApiOperation({ summary: `Update Profile` })
  @ApiBody({ type: UserProfileDto })
  @ApiOkResponse({ type: UserProfile })
  @UsePipes(new BaseValidationPipe({ skipMissingProperties: true }))
  async updateProfile(@Body() input: UserProfileDto): Promise<UserProfile> {
    return this.profileService.updateProfile(input);
  }

  @Put('/password')
  @ApiOperation({ summary: `Change Password` })
  @ApiBody({ type: UserPasswordDto })
  @ApiOkResponse({ type: UserProfile })
  @UsePipes(new BaseValidationPipe())
  async changePassword(@Body() input: UserPasswordDto): Promise<UserProfile> {
    return this.profileService.changePassword(input);
  }

  @Put('/fcm')
  @ApiOperation({ summary: `Update Registration ID` })
  @ApiBody({ type: UserFcmDto })
  @ApiOkResponse({ type: UserProfile })
  @UsePipes(new BaseValidationPipe())
  async updateRegistrationID(@Body() input: UserFcmDto): Promise<UserProfile> {
    return this.profileService.updateRegistrationID(input);
  }

  @Delete('/')
  @ApiOperation({ summary: `Logout` })
  @ApiOkResponse({ type: BaseResponseDto })
  async logout(): Promise<BaseResponseDto> {
    return this.profileService.revokedMe();
  }

  @Delete('/revoke')
  @ApiOperation({ summary: `Revoke session` })
  @ApiBody({ type: UserRevokeDto })
  @ApiOkResponse({ type: BaseResponseDto })
  @ApiExcludeEndpoint()
  @UsePipes(new BaseValidationPipe())
  async revoke(@Body() input: UserRevokeDto): Promise<BaseResponseDto> {
    return this.profileService.revokedOther(input.tokenIds);
  }
}
