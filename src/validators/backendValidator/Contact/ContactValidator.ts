import { Contact } from "@octocloud/types";
import {
  ModelValidator,
  StringArrayValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class ContactValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = `${path}.contact`;
  }

  public validate = (contact: Contact): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.fullName`, contact?.fullName, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.firstName`, contact?.firstName, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.lastName`, contact?.lastName, {
        nullable: true,
      }),
      StringValidator.validate(
        `${this.path}.emailAddress`,
        contact?.emailAddress,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.phoneNumber`,
        contact?.phoneNumber,
        {
          nullable: true,
        }
      ),
      StringArrayValidator.validate(`${this.path}.locales`, contact?.locales),
      StringValidator.validate(`${this.path}.country`, contact?.country, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.notes`, contact?.notes, {
        nullable: true,
      }),
    ].filter(Boolean);
  };
}
