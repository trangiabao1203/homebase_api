import { MongoSchema, Prop, Schema } from '@joktec/mongo';
import { isEmpty } from 'lodash';
import { CdnTransform } from '../../../utils';
import { AssetStatus } from './asset.enum';

@Schema({ collection: 'assets', textSearch: 'title,subhead', index: 'key', paranoid: true })
export class Asset extends MongoSchema {
  @Prop({ required: true, example: 'my_filename.png' })
  title!: string;

  @Prop({ default: null })
  subhead?: string;

  @Prop({ default: null })
  description?: string;

  @Prop({ required: true, trim: true, immutable: true, example: 'my_filename.png' })
  originalName!: string;

  @Prop({ required: true, trim: true, immutable: true, example: `https://example.com/image.png` })
  @CdnTransform()
  key!: string;

  @Prop({ trim: true, default: null, immutable: v => !isEmpty(v), example: 'f74b82c901415ff5e8c8ec13e31d2c8a' })
  etag!: string;

  @Prop({ trim: true, immutable: true, example: 'image/png' })
  mimeType!: string;

  @Prop({ type: [String], default: [], lowercase: true })
  tags?: string[];

  @Prop({ default: 0, unsigned: true })
  size!: number;

  @Prop({ default: null, unsigned: true })
  width?: number;

  @Prop({ default: null, unsigned: true })
  height?: number;

  @Prop({ required: true, enum: AssetStatus, example: AssetStatus.ACTIVATED })
  status!: AssetStatus;
}
