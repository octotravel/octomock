import { Pricing, Tax } from "@octocloud/types";
import {
  ModelValidator,
  NumberValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class PricingValidator implements ModelValidator {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  public setPath = (path: string): void => {
    this.path = path;
  };

  public validate = (pricing: Pricing): ValidatorError[] => {
    return [
      NumberValidator.validate(`${this.path}.original`, pricing?.original, {
        integer: true,
      }),
      NumberValidator.validate(`${this.path}.retail`, pricing?.retail, {
        integer: true,
      }),
      NumberValidator.validate(`${this.path}.net`, pricing?.net, {
        nullable: true,
        integer: true,
      }),
      StringValidator.validate(`${this.path}.currency`, pricing?.currency),
      NumberValidator.validate(`${this.path}.currencyPrecision`, pricing?.currencyPrecision, {
        integer: true,
      }),
      ...this.validateTaxes(pricing?.includedTaxes ?? []),
    ].flatMap((v) => (v ? [v] : []));
  };

  private validateTaxes = (taxes: Tax[]): ValidatorError[] => {
    return taxes
      .map((tax, i) => [
        StringValidator.validate(`${this.path}.taxes[${i}].name`, tax?.name),
        NumberValidator.validate(`${this.path}.taxes[${i}].retail`, tax?.retail, {
          integer: true,
        }),
        NumberValidator.validate(`${this.path}.taxes[${i}].original`, tax?.original, {
          integer: true,
        }),
        NumberValidator.validate(`${this.path}.taxes[${i}].net`, tax?.net, {
          integer: true,
          nullable: true,
        }),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };
}
