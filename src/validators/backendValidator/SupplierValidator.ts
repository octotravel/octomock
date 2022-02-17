import { StringValidator } from "./ValidatorHelpers";
import { Supplier } from "../../types/Supplier";

export class SupplierValidator {
  private path: string;
  constructor(path?: string) {
    this.path = this.path ? `${path}supplier` : `supplier`;
  }

  public validate = (supplier: Supplier): void => {
    StringValidator.validate(`${this.path}.id`, supplier.id);
    StringValidator.validate(`${this.path}.name`, supplier.name);
    StringValidator.validate(`${this.path}.endpoint`, supplier.endpoint);

    this.validateContact(supplier);
  };

  private validateContact = (supplier: Supplier): void => {
    StringValidator.validate(
      `${this.path}.contact.website`,
      supplier.contact.website,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.contact.email`,
      supplier.contact.email,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.contact.telephone`,
      supplier.contact.telephone,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.contact.address`,
      supplier.contact.address,
      { nullable: true }
    );
  };
}
