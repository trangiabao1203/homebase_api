import { GeoIp, IBrowser, ICPU, IDevice, IEngine, IOS } from '@joktec/core';
import { MongoSchema, Prop, PropType, Ref, Schema } from '@joktec/mongo';
import { User } from '../../users';
import { SessionStatus, SessionType } from './session.enum';

@Schema({ collection: 'sessions', paranoid: true })
export class Session extends MongoSchema {
  @Prop({ required: true })
  tokenId!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: true, enum: SessionType })
  type!: SessionType;

  @Prop({ required: true, default: new Date() })
  lastActiveAt!: Date;

  @Prop({ default: null })
  revokedAt?: Date;

  @Prop({})
  userAgent?: string;

  @Prop({})
  ipAddress?: string;

  @Prop({ type: Object }, PropType.MAP)
  geoIp?: Omit<GeoIp, 'ipAddress'>;

  @Prop({ type: Object }, PropType.MAP)
  os?: IOS;

  @Prop({ type: Object }, PropType.MAP)
  browser?: IBrowser;

  @Prop({ type: Object }, PropType.MAP)
  device?: IDevice;

  @Prop({ type: Object }, PropType.MAP)
  cpu?: ICPU;

  @Prop({ type: Object }, PropType.MAP)
  engine?: IEngine;

  @Prop({ default: null })
  registrationId?: string;

  @Prop({ type: String, ref: () => User, default: null })
  userId?: Ref<User, string>;

  @Prop({ required: true, enum: SessionStatus })
  status!: SessionStatus;
}
