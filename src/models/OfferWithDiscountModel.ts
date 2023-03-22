import { OfferModel } from "@octocloud/generators";
import { OfferDiscountModel } from "./OfferDiscountModel";

export class OfferWithDiscountModel extends OfferModel {
  public readonly offerDiscountModel: OfferDiscountModel;

  constructor({
    offerModel,
    offerDiscountModel,
  }: {
    offerModel: OfferModel;
    offerDiscountModel: OfferDiscountModel;
  }) {
    super({ ...offerModel });
    this.offerDiscountModel = offerDiscountModel;
  }

  public toOfferModel(): OfferModel {
    return new OfferModel({ ...this });
  }
}
