import {
  CapabilityId,
  Booking,
  BookingStatus,
  DeliveryMethod,
} from "@octocloud/types";
import { BookingStateValidator } from "./BookingStateValidator";
import { OptionValidator } from "./OptionValidator";
import { ProductValidator } from "./ProductValidator";
import {
  BooleanValidator,
  EnumArrayValidator,
  EnumValidator,
  RegExpValidator,
  StringValidator,
} from "./ValidatorHelpers";
import { ContactValidator } from "./ContactValidator";
import { UnitItemValidator } from "./UnitItemValidator";
import { PricingValidator } from "./PricingValidator";
import { CommonValidator } from "./CommonValidator";

// TODO: add support for validating pricing
// TODO: add support for validating delivery method related things

export class BookingValidator {
  private path: string;
  private productValidator: ProductValidator;
  private optionValidator: OptionValidator;
  private bookingStateValidator: BookingStateValidator;
  private contactValidator: ContactValidator;
  private pricingValidator: PricingValidator;
  private capabilites: CapabilityId[];
  constructor(capabilites: CapabilityId[]) {
    this.path = `booking`;
    this.capabilites = capabilites;
    this.productValidator = new ProductValidator(this.path, this.capabilites);
    this.optionValidator = new OptionValidator(
      `${this.path}.option`,
      this.capabilites
    );
    this.bookingStateValidator = new BookingStateValidator();
    this.contactValidator = new ContactValidator(this.path);
    this.pricingValidator = new PricingValidator(`${this.path}.pricing`);
  }

  public validate = (booking: Booking): void => {
    StringValidator.validate(`${this.path}.id`, booking.id);
    StringValidator.validate(`${this.path}.uuid`, booking.uuid);
    BooleanValidator.validate(`${this.path}.testMode`, booking.testMode);
    StringValidator.validate(
      `${this.path}.resellerReference`,
      booking.resellerReference,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.supplierReference`,
      booking.supplierReference,
      { nullable: true }
    );
    EnumValidator.validate(
      `${this.path}.status`,
      booking.status,
      Object.values(BookingStatus)
    );
    this.bookingStateValidator.validate(booking);
    StringValidator.validate(`${this.path}.productId`, booking.productId);
    this.productValidator.validate(booking.product);
    StringValidator.validate(`${this.path}.optionId`, booking.optionId);
    this.optionValidator.validate(booking.option);
    BooleanValidator.validate(`${this.path}.cancellable`, booking.cancellable);
    BooleanValidator.validate(`${this.path}.freesale`, booking.freesale);
    this.validateBookingAvailability(booking);
    this.contactValidator.validate(booking.contact);
    StringValidator.validate(`${this.path}.notes`, booking.notes, {
      nullable: true,
    });
    EnumArrayValidator.validate(
      `${this.path}.deliveryMethods`,
      booking.deliveryMethods,
      Object.values(DeliveryMethod)
    );
    this.validateUnitItems(booking);
    this.validatePricingCapability(booking);
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

  private validateBookingAvailability = (booking: Booking): void => {
    this.validateLocalDateTime(
      `${this.path}.availabilityId`,
      booking.availabilityId
    );
    this.validateLocalDateTime(
      `${this.path}.availability.id`,
      booking.availability.id
    );
    this.validateLocalDateTime(
      `${this.path}.availability.localDateTimeStart`,
      booking.availability.localDateTimeStart
    );
    this.validateLocalDateTime(
      `${this.path}.availability.localDateTimeEnd`,
      booking.availability.localDateTimeEnd
    );
    BooleanValidator.validate(
      `${this.path}.availability.allDay`,
      booking.availability.allDay
    );
    CommonValidator.validateOpeningHours(
      `${this.path}.availability`,
      booking.availability.openingHours
    );
  };

  private validateUnitItems = (booking: Booking): void => {
    booking.unitItems.forEach((unitItem, i) => {
      const validator = new UnitItemValidator(
        `${this.path}.unitItems[${i}]`,
        this.capabilites
      );
      validator.validate(unitItem);
    });
  };

  private validatePricingCapability = (booking: Booking): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      this.pricingValidator.validate(booking.pricing);
    }
  };
}
