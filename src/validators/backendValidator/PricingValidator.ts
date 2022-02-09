import { NumberValidator, StringValidator } from "./ValidatorHelpers";
import { Pricing, Tax } from "./../../types/Pricing";

export class PricingValidator {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  public setPath = (path: string): void => {
    this.path = path;
  };

  public validate = (pricing: Pricing): void => {
    NumberValidator.validate(`${this.path}.original`, pricing.original, {
      integer: true,
    });
    NumberValidator.validate(`${this.path}.retail`, pricing.retail, {
      integer: true,
    });
    NumberValidator.validate(`${this.path}.net`, pricing.net, {
      nullable: true,
      integer: true,
    });
    StringValidator.validate(`${this.path}.currency`, pricing.currency);
    NumberValidator.validate(
      `${this.path}.currencyPrecision`,
      pricing.currencyPrecision,
      {
        integer: true,
      }
    );
    this.validateTaxes(pricing.includedTaxes);
  };

  private validateTaxes = (taxes: Tax[]): void => {
    taxes.forEach((tax, i) => {
      StringValidator.validate(`${this.path}.taxes[${i}].name`, tax.name);
      NumberValidator.validate(`${this.path}.taxes[${i}].retail`, tax.retail, {
        integer: true,
      });
      NumberValidator.validate(
        `${this.path}.taxes[${i}].original`,
        tax.retail,
        { integer: true }
      );
      NumberValidator.validate(`${this.path}.taxes[${i}].net`, tax.retail, {
        integer: true,
        nullable: true,
      });
    });
  };
}
