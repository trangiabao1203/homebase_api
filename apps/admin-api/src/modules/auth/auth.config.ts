import { JwtConfig, toBool, toInt } from '@joktec/core';

export class AuthConfig extends JwtConfig {
  pending: number;
  limit: number;
  skipOtp?: boolean;

  constructor(props: Partial<AuthConfig>) {
    super(props);
    Object.assign(this, {
      pending: toInt(props.pending, 30),
      limit: toInt(props.limit, 4),
      skipOtp: toBool(props.skipOtp, false),
    });
  }
}
