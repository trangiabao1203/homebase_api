import { CallHandler, ExecutionContext, hashPassword, HttpMethod, Injectable, NestInterceptor } from '@joktec/core';
import { Observable } from 'rxjs';
import { Request } from '../../../base';
import { User } from '../models';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request<User>>();

    if (req.method === HttpMethod.POST || req.method === HttpMethod.PUT) {
      if (req.body.password) {
        req.body.hashPassword = hashPassword(req.body.password);
      }
    }

    return next.handle();
  }
}
