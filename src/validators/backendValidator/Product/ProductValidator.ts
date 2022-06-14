import {
  CapabilityId,
  Product,
  DeliveryFormat,
  DeliveryMethod,
  RedemptionMethod,
  AvailabilityType,
} from "@octocloud/types";
import { OptionValidator } from "../Option/OptionValidator";
import {
  StringValidator,
  BooleanValidator,
  EnumValidator,
  EnumArrayValidator,
  ValidatorError,
  ModelValidator,
} from "../ValidatorHelpers";
import { ProductPricingValidator } from "./ProductPricingValidator";

export class ProductValidator implements ModelValidator {
  private pricingValidator: ProductPricingValidator;
  private path: string;
  private capabilities: CapabilityId[];

  constructor({
    path,
    capabilities,
  }: {
    path?: string;
    capabilities: CapabilityId[];
  }) {
    this.path = `${path}product`;
    this.capabilities = capabilities;
    this.pricingValidator = new ProductPricingValidator({ path: this.path });
  }

  public validate = (product: Product): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, product.id),
      StringValidator.validate(
        `${this.path}.internalName`,
        product.internalName
      ),
      StringValidator.validate(`${this.path}.reference`, product.reference, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.locale`, product.locale),
      StringValidator.validate(`${this.path}.timeZone`, product.timeZone),
      BooleanValidator.validate(
        `${this.path}.allowFreesale`,
        product.allowFreesale
      ),
      BooleanValidator.validate(
        `${this.path}.instantConfirmation`,
        product.instantConfirmation
      ),
      // this one
      StringValidator.validate(
        `${this.path}.instantDelivery`,
        product.instantDelivery
      ),
      // this one
      StringValidator.validate(
        `${this.path}.availabilityRequired`,
        product.availabilityRequired
      ),
      EnumValidator.validate(
        `${this.path}.availabilityType`,
        product.availabilityType,
        [AvailabilityType.START_TIME, AvailabilityType.OPENING_HOURS]
      ),
      EnumArrayValidator.validate(
        `${this.path}.deliveryFormats`,
        product.deliveryFormats,
        Object.values(DeliveryFormat),
        { min: 1 }
      ),
      EnumArrayValidator.validate(
        `${this.path}.deliveryMethods`,
        product.deliveryMethods,
        Object.values(DeliveryMethod),
        { min: 1 }
      ),
      EnumValidator.validate(
        `${this.path}.redemptionMethod`,
        product.redemptionMethod,
        [RedemptionMethod.DIGITAL, RedemptionMethod.PRINT]
      ),
      ...this.validateOptions(product),

      ...this.validatePricingCapability(product),
    ].filter(Boolean);
  };

  private validateOptions = (product: Product): ValidatorError[] => {
    return product.options
      .map((option, i) => {
        const optionValidator = new OptionValidator({
          path: `${this.path}.options[${i}]`,
          capabilities: this.capabilities,
        });
        return optionValidator.validate(option, product.pricingPer);
      })
      .flat(1)
      .filter(Boolean);
  };

  private validatePricingCapability = (product: Product): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pricing)) {
      return this.pricingValidator.validate(product);
    }
    return [];
  };

  // private validateContentCapability = (product: Product): void => {
  //   if (this.capabilities.includes(CapabilityId.Content)) {
  //     // this.contentValidator.validate(product);
  //   }
  // };
}
