import { Injectable } from '@joktec/core';
import { MongoRepo, MongoService } from '@joktec/mongo';
import { Product } from './models';

@Injectable()
export class ProductRepo extends MongoRepo<Product, string> {
  constructor(protected mongoService: MongoService) {
    super(mongoService, Product);
  }
}
