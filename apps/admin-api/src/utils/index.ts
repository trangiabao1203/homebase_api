import { IsStrongPasswordOptions } from '@joktec/core';

export const PASSWORD_OPTIONS: IsStrongPasswordOptions = {
  minLength: 6,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 0,
};

export * from './transform';
export * from './cdn-transform';
