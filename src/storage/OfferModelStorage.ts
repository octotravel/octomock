import { InMemoryStorage } from "./InMemoryStorage";
import { InvalidProductIdError } from "../models/Error";

import { OfferModel } from "@octocloud/generators";
import { OfferWithDiscountModel } from "../models/OfferWithDiscountModel";
import { OfferWithDiscountModelGenerator } from "../generators/OfferWithDiscountModelGenerator";

export class OfferModelStorage implements InMemoryStorage<OfferModel> {
  private readonly offerWithDiscountModels: Map<string, OfferWithDiscountModel> = new Map();
  private readonly OfferWithDiscountModelGenerator = new OfferWithDiscountModelGenerator();

  constructor() {
    this.OfferWithDiscountModelGenerator.generateMultipleOffers().forEach((offerWithDiscount) => {
      this.offerWithDiscountModels.set(offerWithDiscount.code, offerWithDiscount);
    });
  }

  public get(code: string): OfferModel {
    return this.getWithDiscount(code).toOfferModel();
  }

  public getWithDiscount(id: string): OfferWithDiscountModel {
    if (this.offerWithDiscountModels.has(id) == false) {
      throw new InvalidProductIdError(id);
    }

    return this.offerWithDiscountModels.get(id)!;
  }

  public getAll(): OfferModel[] {
    return this.getAllWithDiscounts().map((offerWithDiscountModel) => {
      return offerWithDiscountModel.toOfferModel();
    });
  }

  public getAllWithDiscounts(): OfferWithDiscountModel[] {
    return Array.from(this.offerWithDiscountModels.values());
  }
}
