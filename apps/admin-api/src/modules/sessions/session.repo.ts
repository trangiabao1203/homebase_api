import { Injectable } from '@joktec/core';
import { MongoRepo, MongoService } from '@joktec/mongo';
import { uniqBy } from 'lodash';
import { Session, SessionStatus } from './models';

@Injectable()
export class SessionRepo extends MongoRepo<Session, string> {
  constructor(protected mongoService: MongoService) {
    super(mongoService, Session);
  }

  async findTokenByUserIds(userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];
    const sessions = await this.find({
      condition: {
        userId: { $in: userIds },
        status: SessionStatus.ACTIVATED,
        revokedAt: null,
        registrationId: { $ne: null },
        expiresAt: { $gt: new Date() },
      },
    });
    return uniqBy(sessions, 'registrationId').map(s => s.registrationId);
  }
}
