import { OfferModel } from '@octocloud/generators';
import { InMemoryStorage } from './InMemoryStorage';

import { OfferWithDiscountModel } from '../models/OfferWithDiscountModel';
import { OfferWithDiscountModelGenerator } from '../generators/OfferWithDiscountModelGenerator';
import InvalidOfferCodeError from '../errors/InvalidOfferCodeError';

export class OfferModelStorage implements InMemoryStorage<OfferModel> {
  private readonly offerWithDiscountModels = new Map<string, OfferWithDiscountModel>();

  private readonly OfferWithDiscountModelGenerator = new OfferWithDiscountModelGenerator();

  public constructor() {
    this.OfferWithDiscountModelGenerator.generateMultipleOffers().forEach((offerWithDiscount) => {
      this.offerWithDiscountModels.set(offerWithDiscount.code, offerWithDiscount);
    });
  }

  public get(code: string): OfferModel {
    return this.getWithDiscount(code).toOfferModel();
  }

  public getWithDiscount(id: string): OfferWithDiscountModel {
    if (!this.offerWithDiscountModels.has(id)) {
      throw new InvalidOfferCodeError(id);
    }

    return this.offerWithDiscountModels.get(id)!;
  }

  public getAll(): OfferModel[] {
    return this.getAllWithDiscounts().map((offerWithDiscountModel) => offerWithDiscountModel.toOfferModel());
  }

  public getAllWithDiscounts(): OfferWithDiscountModel[] {
    return Array.from(this.offerWithDiscountModels.values());
  }
}
