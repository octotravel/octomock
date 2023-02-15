import { OfferWithDiscountModel } from "../models/OfferWithDiscountModel";
import { OfferPreset } from "@octocloud/generators";
import { OfferDiscountModel, OfferDiscountType } from "../models/OfferDiscountModel";

export class OfferWithDiscountModelGenerator {
  public generateMultipleOffers(): OfferWithDiscountModel[] {
    return [
      new OfferWithDiscountModel({
        offerModel: OfferPreset.TEN_PERCENT_OFF_MODEL,
        offerDiscountModel: new OfferDiscountModel({
          type: OfferDiscountType.PERCENTAGE,
          amount: 10,
        }),
      }),
    ];
  }
}
