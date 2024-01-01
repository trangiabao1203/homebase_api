import { ApiPropertyOptional, Expose, isNotEmpty } from '@joktec/core';
import { Prop, Schema } from '@joktec/mongo';

@Schema({ schemaOptions: { _id: false, timestamps: false } })
export class Address {
  @Prop({ default: '', example: '123 Đường số 4' })
  addressLine1?: string;

  @Prop({ default: '', example: 'Lầu 5' })
  addressLine2?: string;

  @Prop({ default: '', example: 'Phường 6' })
  ward?: string;

  @Prop({ default: '', example: 'Quận 7' })
  district?: string;

  @Prop({ default: '', example: 'Hồ Chí Minh' })
  city?: string;

  @Prop({ default: '', example: 'Hồ Chí Minh' })
  state?: string;

  @Prop({ default: '', example: '700000' })
  postal?: string;

  @Prop({ default: '', example: 'Việt Nam' })
  country?: string;

  @Expose({ toPlainOnly: true })
  @ApiPropertyOptional({ example: '123 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, Hồ Chí Minh' })
  get fullAddress(): string {
    return [
      this.addressLine1,
      this.addressLine2,
      this.ward,
      this.district,
      this.city,
      this.state,
      this.postal,
      this.country,
    ]
      .filter(isNotEmpty)
      .join(', ');
  }
}
