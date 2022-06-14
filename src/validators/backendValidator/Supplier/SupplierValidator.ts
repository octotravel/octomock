import { Supplier } from "@octocloud/types";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class SupplierValidator implements ModelValidator {
  private path: string;
  constructor(path?: string) {
    this.path = this.path ? `${path}supplier` : `supplier`;
  }

  public validate = (supplier: Supplier): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, supplier.id),
      StringValidator.validate(`${this.path}.name`, supplier.name),
      StringValidator.validate(`${this.path}.endpoint`, supplier.endpoint),

      ...this.validateContact(supplier),
    ].filter(Boolean);
  };

  private validateContact = (supplier: Supplier): ValidatorError[] =>
    [
      StringValidator.validate(
        `${this.path}.contact.website`,
        supplier.contact.website,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.contact.email`,
        supplier.contact.email,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.contact.telephone`,
        supplier.contact.telephone,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.contact.address`,
        supplier.contact.address,
        { nullable: true }
      ),
    ].filter(Boolean);
}
