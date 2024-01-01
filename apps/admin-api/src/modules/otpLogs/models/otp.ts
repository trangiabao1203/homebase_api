import { MongoSchema, Prop, Schema } from '@joktec/mongo';
import moment from 'moment';
import { OTPStatus, OTPType } from './otp.enum';

@Schema({ collection: 'otpLogs', textSearch: 'phone,email', paranoid: true })
export class Otp extends MongoSchema {
  @Prop({ required: true, isPhone: { locale: 'vi-VN' } })
  phone?: string;

  @Prop({ isEmail: true })
  email?: string;

  @Prop({ required: true })
  publicCode!: string;

  @Prop({ required: true })
  privateCode!: string;

  @Prop({ required: false, default: null })
  activeCode!: string;

  @Prop({ required: true, enum: OTPType })
  type!: OTPType;

  @Prop({ required: true, enum: OTPStatus })
  status!: OTPStatus;

  @Prop({ required: true, default: moment().startOf('ms').add(30, 'second').toDate() })
  expired!: Date;

  @Prop({ required: true, default: 30, min: 0 })
  expiredInSeconds!: number;

  @Prop({ required: true, default: 1, min: 1, max: 5 })
  retry!: number;
}
