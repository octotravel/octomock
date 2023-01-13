import {
  SupplierDestination,
  SupplierCategory,
  Supplier,
} from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  StringArrayValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class SupplierContentValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (supplier: Supplier): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.country`, supplier?.country),
      ...this.validateDestination(supplier?.destinations ?? []),
    ].flatMap((v) => (v ? [v] : []));
  };

  private validateDestination = (
    destinations: SupplierDestination[]
  ): ValidatorError[] => {
    return destinations
      .map((destination, i) => [
        StringValidator.validate(
          `${this.path}.destinations[${i}].id`,
          destination?.id
        ),
        BooleanValidator.validate(
          `${this.path}.destinations[${i}].default`,
          destination?.default
        ),
        StringValidator.validate(
          `${this.path}.destinations[${i}].name`,
          destination?.name
        ),
        StringValidator.validate(
          `${this.path}.destinations[${i}].country`,
          destination?.country
        ),

        StringValidator.validate(
          `${this.path}.destinations[${i}].contact.website`,
          destination?.contact?.website,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.destinations[${i}].contact.email`,
          destination?.contact?.email,
          {
            nullable: true,
          }
        ),
        StringValidator.validate(
          `${this.path}.destinations[${i}].contact.telephone`,
          destination?.contact?.telephone,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.destinations[${i}].contact.address`,
          destination?.contact?.address,
          { nullable: true }
        ),
        ...this.validateCategories(
          destination?.categories as SupplierCategory[]
        ),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };

  private validateCategories = (
    categories: SupplierCategory[]
  ): ValidatorError[] => {
    return (categories ?? [])
      .map((category, i) => [
        StringValidator.validate(
          `${this.path}.categories[${i}].id`,
          category?.id
        ),
        BooleanValidator.validate(
          `${this.path}.categories[${i}].default`,
          category?.default
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].title`,
          category?.title
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].shortDescription`,
          category?.shortDescription,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].coverImageUrl`,
          category?.coverImageUrl,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].bannerImageUrl`,
          category?.bannerImageUrl,
          { nullable: true }
        ),
        StringArrayValidator.validate(
          `${this.path}.categories[${i}].productIds`,
          category?.productIds
        ),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };
}
