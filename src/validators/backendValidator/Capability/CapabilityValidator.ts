import { Capability, CapabilityId } from "@octocloud/types";
import {
  BooleanValidator,
  EnumArrayValidator,
  EnumValidator,
  ModelValidator,
  NumberValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class CapabilityValidator implements ModelValidator {
  private path: string;

  constructor({ path = "" }: { path?: string }) {
    this.path = this.path ? `${path}capability` : `capability`;
  }

  public validate = (capability: Capability): ValidatorError[] => {
    return [
      EnumValidator.validate(`${this.path}.id`, capability?.id, Object.values(CapabilityId)),
      NumberValidator.validate(`${this.path}.revision`, capability?.revision),
      BooleanValidator.validate(`${this.path}.required`, capability?.required),
      EnumArrayValidator.validate(
        `${this.path}.dependencies`,
        capability?.dependencies,
        Object.values(CapabilityId)
      ),
      StringValidator.validate(`${this.path}.docs`, capability?.docs, {
        nullable: true,
      }),
    ].flatMap((v) => (v ? [v] : []));
  };
}
