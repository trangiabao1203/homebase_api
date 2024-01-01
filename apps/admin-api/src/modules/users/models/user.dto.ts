import { ApiProperty, IsNotEmpty, IsStrongPassword, OmitType } from '@joktec/core';
import { PASSWORD_OPTIONS } from '../../../utils';
import { User } from './user';

export class UserDto extends OmitType(User, [
  '_id',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
  'hashPassword',
] as const) {
  @IsNotEmpty({ message: 'PASSWORD_REQUIRED' })
  @IsStrongPassword(PASSWORD_OPTIONS, { message: 'PASSWORD_WEEK' })
  @ApiProperty()
  password!: string;
}
