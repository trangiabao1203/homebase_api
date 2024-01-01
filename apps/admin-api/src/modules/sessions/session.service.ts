import { BaseService, Injectable } from '@joktec/core';
import { Session, SessionStatus } from './models';
import { SessionRepo } from './session.repo';

@Injectable()
export class SessionService extends BaseService<Session, string> {
  constructor(protected sessionRepo: SessionRepo) {
    super(sessionRepo);
  }

  async revoke(tokenId: string): Promise<Session> {
    return this.sessionRepo.update(
      { tokenId },
      {
        revokedAt: new Date(),
        status: SessionStatus.DISABLED,
      },
    );
  }
}
