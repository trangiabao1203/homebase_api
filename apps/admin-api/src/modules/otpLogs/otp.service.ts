import { BaseService, Injectable } from '@joktec/core';
import moment from 'moment';
import { Otp, OTPStatus, OTPType } from './models';
import { OtpRepo } from './otp.repo';

@Injectable()
export class OtpService extends BaseService<Otp, string> {
  constructor(protected otpRepo: OtpRepo) {
    super(otpRepo);
  }

  async findLastOtpByPhone(phone: string, type: OTPType): Promise<Otp[]> {
    return this.otpRepo.find({
      condition: {
        phone,
        type,
        createdAt: {
          $gte: moment().startOf('date').toDate(),
          $lte: moment().endOf('date').toDate(),
        },
        status: { $nin: [OTPStatus.DISABLED, OTPStatus.SUCCESS] },
      },
      sort: { createdAt: 'desc' },
    });
  }

  async deleteByPhone(phoneOrEmail: string): Promise<number> {
    const opts = await this.otpRepo.find({
      condition: {
        $or: [{ phone: phoneOrEmail }, { email: phoneOrEmail }],
      },
    });
    const res = await Promise.all(opts.map(o => this.otpRepo.delete({ _id: o._id }, { force: true })));
    return res.length;
  }
}
