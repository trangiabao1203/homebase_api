import { MongoSchema, Prop, Schema } from '@joktec/mongo';
import moment from 'moment';
import { CdnTransform } from '../../../utils';
import { UserGender, UserRole, UserStatus } from './user.enum';

@Schema({ collection: 'users', textSearch: 'fullName,phone,email', paranoid: true, unique: ['phone', 'email'] })
export class User extends MongoSchema {
  @Prop({ required: true, example: 'John Doe' })
  fullName!: string;

  @Prop({ required: true, isPhone: { locale: 'vi-VN' } })
  phone!: string;

  @Prop({ trim: true, lowercase: true, isEmail: true, default: null })
  email?: string;

  @Prop({ exclude: true })
  hashPassword?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ addNullToEnum: true, enum: UserGender, default: UserGender.UNKNOWN })
  gender?: UserGender;

  @Prop({ default: moment().startOf('year').toDate() })
  birthday?: Date;

  @Prop({ default: null, example: 'https://example.com/image.png' })
  @CdnTransform()
  image?: string;

  @Prop({ default: null, example: 'https://example.com/image.png' })
  @CdnTransform()
  thumbnail?: string;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.PENDING })
  status!: UserStatus;
}
