import { OfferModel } from '@octocloud/generators';
import { OfferModelStorage } from '../storage/OfferModelStorage';
import { OfferWithDiscountModel } from '../models/OfferWithDiscountModel';

interface IOfferRepository {
  getOffers: () => OfferModel[];
  getOffersWithDiscount: () => OfferWithDiscountModel[];
  getOffer: (code: string) => OfferModel;
  getOfferWithDiscount: (code: string) => OfferWithDiscountModel;
}

export class OfferRepository implements IOfferRepository {
  private readonly storage = new OfferModelStorage();

  public getOffers(): OfferModel[] {
    return this.storage.getAll();
  }

  public getOffersWithDiscount(): OfferWithDiscountModel[] {
    return this.storage.getAllWithDiscounts();
  }

  public getOffer(code: string): OfferModel {
    return this.storage.get(code);
  }

  public getOfferWithDiscount(code: string): OfferWithDiscountModel {
    return this.storage.getWithDiscount(code);
  }
}
