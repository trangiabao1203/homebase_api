import { generateUUID, Injectable, LogService } from '@joktec/core';
import gravatar from 'gravatar';
import { head } from 'lodash';
import { Gravatar, GravatarResponse } from '../../base';

@Injectable()
export class UserUtils {
  constructor(private logger: LogService) {
    this.logger.setContext(UserUtils.name);
  }

  async getGravatar(email: string): Promise<Gravatar> {
    const options = { s: '200', r: 'pg', d: 'robohash' };
    if (!email) {
      const fakeEmail = `${generateUUID()}@gmail.com`;
      return {
        photoUrl: gravatar.url(fakeEmail, options, true),
        thumbnailUrl: gravatar.url(fakeEmail, options, true),
      };
    }

    const photoUrl = gravatar.url(email, options, true);
    const thumbnailUrl = gravatar.url(email, options, true);
    try {
      const profileUrl = gravatar.profile_url(email, { protocol: 'https', format: 'json' }, true);
      const response = await fetch(profileUrl);
      const json = await response.json();
      if (json === 'User not found') {
        return { photoUrl, thumbnailUrl } as Gravatar;
      }

      const profile = head((json as GravatarResponse).entry);
      return {
        photoUrl,
        thumbnailUrl,
        fullName: profile?.name?.formatted || profile?.displayName,
        currentLocation: profile?.currentLocation,
      } as Gravatar;
    } catch (err) {
      console.log('getGravatar', err);
    }
    return { photoUrl, thumbnailUrl } as Gravatar;
  }
}
