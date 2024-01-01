import { OmitType } from '@joktec/core';
import { Product } from './product';

export class ProductDto extends OmitType(Product, [
  '_id',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
] as const) {}
