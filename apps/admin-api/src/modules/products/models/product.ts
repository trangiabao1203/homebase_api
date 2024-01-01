import { MongoSchema, Prop, Schema } from '@joktec/mongo';
import { CdnTransform } from '../../../utils';
import { ProductStatus, ProductType } from './product.enum';

@Schema({ collection: 'products', textSearch: 'title,subhead', paranoid: true, unique: 'code' })
export class Product extends MongoSchema {
  @Prop({ required: true, trim: true, uppercase: true, immutable: false, example: 'A2779' })
  code!: string;

  @Prop({ required: true, comment: 'Product name', example: 'Macbook Pro M2' })
  title!: string;

  @Prop({ default: null })
  subhead?: string;

  @Prop({ default: null })
  description?: string;

  @Prop({ required: true, enum: ProductType, example: ProductType.DEFAULT })
  type!: ProductType;

  @Prop({ default: null, example: 'https://example.com/image.png' })
  @CdnTransform()
  image?: string;

  @Prop({ default: null, example: 'https://example.com/image.png' })
  @CdnTransform()
  thumbnail?: string;

  @Prop({ default: 0, unsigned: true })
  order?: number;

  @Prop({ default: 0, unsigned: true })
  price?: number;

  @Prop({ default: 0, unsigned: true })
  stock?: number;

  @Prop({ required: true, enum: ProductStatus, example: ProductStatus.ACTIVATED })
  status!: ProductStatus;
}
