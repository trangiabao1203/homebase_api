import { ApiProperty } from '@joktec/core';

export class BaseResponseDto {
  @ApiProperty()
  success!: boolean;
}
