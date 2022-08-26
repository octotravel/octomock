import {
  Availability,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import { CommonValidator } from "../CommonValidator";
import {
  StringValidator,
  BooleanValidator,
  EnumValidator,
  NumberValidator,
  RegExpValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";
import { AvailabilityPickupValidator } from "./AvailabilityPickupValidator";
import { AvailabilityPricingValidator } from "./AvailabilityPricingValidator";

export class AvailabilityValidator implements ModelValidator {
  private pricingValidator: AvailabilityPricingValidator;
  private pickupValidator: AvailabilityPickupValidator;
  private path: string;
  private capabilities: CapabilityId[];
  constructor({
    path,
    capabilities,
  }: {
    path?: string;
    capabilities: CapabilityId[];
  }) {
    this.path = `${path}availability`;
    this.capabilities = capabilities;
    this.pricingValidator = new AvailabilityPricingValidator({
      path: this.path,
    });
    this.pickupValidator = new AvailabilityPickupValidator({
      path: this.path,
    });
  }

  public validate = (availability: Availability): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, availability.id),
      this.validateLocalDateTime(`${this.path}.id`, availability.id),

      StringValidator.validate(
        `${this.path}.localDateTimeStart`,
        availability.localDateTimeStart
      ),
      this.validateLocalDateTime(
        `${this.path}.localDateTimeStart`,
        availability.localDateTimeStart
      ),

      StringValidator.validate(
        `${this.path}.localDateTimeEnd`,
        availability.localDateTimeEnd
      ),
      this.validateLocalDateTime(
        `${this.path}.localDateTimeEnd`,
        availability.localDateTimeEnd
      ),

      BooleanValidator.validate(`${this.path}.allDay`, availability.allDay),
      BooleanValidator.validate(
        `${this.path}.available`,
        availability.available
      ),
      EnumValidator.validate(
        `${this.path}.status`,
        availability.status,
        Object.values(AvailabilityStatus)
      ),
      NumberValidator.validate(
        `${this.path}.vacancies`,
        availability.vacancies,
        {
          nullable: true,
        }
      ),
      NumberValidator.validate(`${this.path}.capacity`, availability.capacity, {
        nullable: true,
      }),
      NumberValidator.validate(`${this.path}.maxUnits`, availability.maxUnits, {
        nullable: true,
      }),

      StringValidator.validate(
        `${this.path}.utcCutoffAt`,
        availability.utcCutoffAt
      ),
      this.validateUTCDate(
        `${this.path}.utcCutoffAt`,
        availability.utcCutoffAt
      ),

      ...CommonValidator.validateOpeningHours(
        this.path,
        availability.openingHours
      ),

      ...this.validatePricingCapability(availability),
      ...this.validatePickupCapability(availability),
    ]
      .flat(1)
      .filter(Boolean);
  };

  private validatePricingCapability = (
    availability: Availability
  ): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pricing)) {
      return this.pricingValidator.validate(availability);
    }
    return [];
  };

  private validatePickupCapability = (
    availability: Availability
  ): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pickups)) {
      return this.pickupValidator.validate(availability);
    }
    return [];
  };

  private validateLocalDateTime = (
    label: string,
    localDateTime: string
  ): ValidatorError => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/
    );
    return RegExpValidator.validate(label, localDateTime, regExp);
  };

  private validateUTCDate = (
    label: string,
    utcDate: string
  ): ValidatorError => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])Z$/
    );
    return RegExpValidator.validate(label, utcDate, regExp);
  };
}
