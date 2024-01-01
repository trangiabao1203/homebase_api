import { applyDecorators, linkTransform, Transform } from '@joktec/core';
import { isArray, isFunction } from 'lodash';

function getHost(host: string | (() => string) | [(...args: any[]) => string, ...args: any[]]): string {
  if (isFunction(host)) return host();
  if (isArray(host)) {
    const [callback, ...args] = host;
    return callback(args);
  }
  return host || process.env.MISC_CDN_URL;
}

export const CdnTransform = (
  host?: string | (() => string) | [(...args: any[]) => string, ...args: any[]],
): PropertyDecorator => {
  return applyDecorators(
    Transform(
      ({ value }) => {
        if (isArray(value)) return value.map(item => linkTransform(item, getHost(host), 'relative'));
        return linkTransform(value, getHost(host), 'relative');
      },
      { toClassOnly: true },
    ),
    Transform(
      ({ value }) => {
        if (isArray(value)) return value.map(item => linkTransform(item, getHost(host), 'absolute'));
        return linkTransform(value, getHost(host), 'absolute');
      },
      { toPlainOnly: true },
    ),
  );
};
