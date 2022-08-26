import { CapabilityId, Supplier } from "@octocloud/types";
import {
  ModelValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";
import { SupplierContentValidator } from "./SupplierContentValidator";

export class SupplierValidator implements ModelValidator {
  private path: string;
  private capabilities: CapabilityId[];
  private contentValidator: SupplierContentValidator;

  constructor({
    path = "",
    capabilities,
  }: {
    path?: string;
    capabilities: CapabilityId[];
  }) {
    this.path = this.path ? `${path}supplier` : `supplier`;
    this.capabilities = capabilities;
    this.contentValidator = new SupplierContentValidator({ path: this.path });
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
      ...this.validateContentCapability(supplier),
    ].filter(Boolean);

  private validateContentCapability = (
    supplier: Supplier
  ): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Content)) {
      return this.contentValidator.validate(supplier);
    }
    return [];
  };
}
