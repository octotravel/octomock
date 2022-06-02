import {
  PricingUnit,
  Availability,
  AvailabilityStatus,
  CapabilityId,
  Pricing,
  AvailabilityCalendar,
} from "@octocloud/types";
import { CommonValidator } from "./CommonValidator";
import {
  StringValidator,
  BooleanValidator,
  EnumValidator,
  NumberValidator,
  RegExpValidator,
} from "./ValidatorHelpers";
import { PricingValidator } from "./PricingValidator";

export class AvailabilityValidator {
  private pricingValidator: AvailabilityPricingValidator;
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = `${path}availability`;
    this.capabilites = capabilites;
    this.pricingValidator = new AvailabilityPricingValidator(this.path);
  }

  public validate = (availability: Availability): void => {
    StringValidator.validate(`${this.path}.id`, availability.id);
    this.validateLocalDateTime(`${this.path}.id`, availability.id);

    StringValidator.validate(
      `${this.path}.localDateTimeStart`,
      availability.localDateTimeStart
    );
    this.validateLocalDateTime(
      `${this.path}.localDateTimeStart`,
      availability.localDateTimeStart
    );

    StringValidator.validate(
      `${this.path}.localDateTimeEnd`,
      availability.localDateTimeEnd
    );
    this.validateLocalDateTime(
      `${this.path}.localDateTimeEnd`,
      availability.localDateTimeEnd
    );

    BooleanValidator.validate(`${this.path}.allDay`, availability.allDay);
    BooleanValidator.validate(`${this.path}.available`, availability.available);
    EnumValidator.validate(
      `${this.path}.status`,
      availability.status,
      Object.values(AvailabilityStatus)
    );
    NumberValidator.validate(`${this.path}.vacancies`, availability.vacancies, {
      nullable: true,
    });
    NumberValidator.validate(`${this.path}.capacity`, availability.capacity, {
      nullable: true,
    });
    NumberValidator.validate(`${this.path}.maxUnits`, availability.maxUnits, {
      nullable: true,
    });

    StringValidator.validate(
      `${this.path}.utcCutoffAt`,
      availability.utcCutoffAt
    );
    this.validateUTCDate(`${this.path}.utcCutoffAt`, availability.utcCutoffAt);

    CommonValidator.validateOpeningHours(this.path, availability.openingHours);

    this.validatePricingCapability(availability);
  };

  private validatePricingCapability = (availability: Availability): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      this.pricingValidator.validate(availability);
    }
  };

  private validateLocalDateTime = (
    label: string,
    localDateTime: string
  ): void => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/
    );
    RegExpValidator.validate(label, localDateTime, regExp);
  };

  private validateUTCDate = (label: string, utcDate: string): void => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])Z$/
    );
    RegExpValidator.validate(label, utcDate, regExp);
  };
}

export class AvailabilityPricingValidator {
  private pricingValidator: PricingValidator;
  private path: string;
  constructor(path: string) {
    this.path = path;
    this.pricingValidator = new PricingValidator(this.path);
  }

  public validate = (availability: Availability): void => {
    if (availability.unitPricing) {
      this.validateUnitPricing(availability.unitPricing as PricingUnit[]);
    } else {
      this.validatePricing(availability.pricing as Pricing);
    }
  };

  private validateUnitPricing = (unitPricing: PricingUnit[]) => {
    unitPricing.forEach((pricing, i) => {
      const path = `${this.path}.unitPricing[${i}]`;
      this.pricingValidator.setPath(path);
      this.pricingValidator.validate(pricing);
      StringValidator.validate(`${path}.unitId`, pricing.unitId);
    });
  };

  private validatePricing = (pricing: Pricing) => {
    this.pricingValidator.setPath(`${this.path}.pricing`);
    this.pricingValidator.validate(pricing);
  };
}

export class AvailabilityCalendarValidator {
  private pricingValidator: AvailabilityCalendarPricingValidator;
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = `${path}availability`;
    this.capabilites = capabilites;
    this.pricingValidator = new AvailabilityCalendarPricingValidator(this.path);
  }

  public validate = (availability: AvailabilityCalendar): void => {
    StringValidator.validate(
      `${this.path}.localDate`,
      availability.localDate
    );
    this.validateLocalDateTime(
      `${this.path}.localDate`,
      availability.localDate
    );

    BooleanValidator.validate(`${this.path}.available`, availability.available);
    EnumValidator.validate(
      `${this.path}.status`,
      availability.status,
      Object.values(AvailabilityStatus)
    );
    NumberValidator.validate(`${this.path}.vacancies`, availability.vacancies, {
      nullable: true,
    });
    NumberValidator.validate(`${this.path}.capacity`, availability.capacity, {
      nullable: true,
    });

    CommonValidator.validateOpeningHours(this.path, availability.openingHours);

    this.validatePricingCapability(availability);
  };

  private validatePricingCapability = (availability: AvailabilityCalendar): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      this.pricingValidator.validate(availability);
    }
  };

  private validateLocalDateTime = (
    label: string,
    localDateTime: string
  ): void => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/
    );
    RegExpValidator.validate(label, localDateTime, regExp);
  };
}

export class AvailabilityCalendarPricingValidator {
  private pricingValidator: PricingValidator;
  private path: string;
  constructor(path: string) {
    this.path = path;
    this.pricingValidator = new PricingValidator(this.path);
  }

  public validate = (availability: AvailabilityCalendar): void => {
    if (availability.unitPricingFrom) {
      this.validateUnitPricing(availability.unitPricingFrom as PricingUnit[]);
    } else {
      this.validatePricing(availability.pricingFrom as Pricing);
    }
  };

  private validateUnitPricing = (unitPricing: PricingUnit[]) => {
    unitPricing.forEach((pricing, i) => {
      const path = `${this.path}.unitPricing[${i}]`;
      this.pricingValidator.setPath(path);
      this.pricingValidator.validate(pricing);
      StringValidator.validate(`${path}.unitId`, pricing.unitId);
    });
  };

  private validatePricing = (pricing: Pricing) => {
    this.pricingValidator.setPath(`${this.path}.pricing`);
    this.pricingValidator.validate(pricing);
  };
}