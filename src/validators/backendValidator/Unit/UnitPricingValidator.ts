import { Unit, Pricing } from "@octocloud/types";
import { PricingValidator } from "../Pricing/PricingValidator";
import { ModelValidator, ValidatorError } from "../ValidatorHelpers";

export class UnitPricingValidator implements ModelValidator {
  private pricingValidator: PricingValidator;
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
    this.pricingValidator = new PricingValidator(path);
  }

  public validate = (unit: Unit): ValidatorError[] => {
    const isOnBooking = this.path.includes("booking");
    if (isOnBooking) {
      return unit?.pricing
        ?.map((pricing, i) => {
          this.pricingValidator.setPath(`${this.path}.pricing[${i}]`);
          return this.pricingValidator.validate(pricing as Pricing);
        })
        .flat(1)
        .flatMap((v) => (v ? [v] : []));
    } else {
      return unit?.pricingFrom
        ?.map((pricingFrom, i) => {
          this.pricingValidator.setPath(`${this.path}.pricingFrom[${i}]`);
          return this.pricingValidator.validate(pricingFrom as Pricing);
        })
        .flat(1)
        .flatMap((v) => (v ? [v] : []));
    }
  };
}
