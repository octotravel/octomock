import { TicketValidator } from "./../Ticket/TicketValidator";
import {
  CapabilityId,
  Booking,
  BookingStatus,
  DeliveryMethod,
} from "@octocloud/types";
import { BookingStateValidator } from "./BookingState/BookingStateValidator";
import { OptionValidator } from "../Option/OptionValidator";
import { ProductValidator } from "../Product/ProductValidator";
import {
  BooleanValidator,
  EnumArrayValidator,
  EnumValidator,
  ModelValidator,
  NullValidator,
  StringValidator,
  ValidatorError,
} from "../ValidatorHelpers";
import { ContactValidator } from "../Contact/ContactValidator";
import { UnitItemValidator } from "../UnitItem/UnitItemValidator";
import { PricingValidator } from "../Pricing/PricingValidator";
import { CommonValidator } from "../CommonValidator";
import { BookingPickupValidator } from "./BookingPickupValidator";

// TODO: add support for validating pricing
// TODO: add support for validating delivery method related things

export class BookingValidator implements ModelValidator {
  private path: string;
  private productValidator: ProductValidator;
  private optionValidator: OptionValidator;
  private bookingStateValidator: BookingStateValidator;
  private contactValidator: ContactValidator;
  private ticketValidator: TicketValidator;
  private pricingValidator: PricingValidator;
  private pickupValidator: BookingPickupValidator;
  private capabilities: CapabilityId[];
  constructor({ capabilities }: { capabilities: CapabilityId[] }) {
    this.path = `booking`;
    this.capabilities = capabilities;
    this.productValidator = new ProductValidator({
      path: `${this.path}.`,
      capabilities: this.capabilities,
    });
    this.optionValidator = new OptionValidator({
      path: `${this.path}.option`,
      capabilities: this.capabilities,
    });
    this.bookingStateValidator = new BookingStateValidator({ path: this.path });
    this.contactValidator = new ContactValidator({ path: this.path });
    this.ticketValidator = new TicketValidator({
      path: `${this.path}.voucher`,
    });
    this.pricingValidator = new PricingValidator(`${this.path}.pricing`);
    this.pickupValidator = new BookingPickupValidator({ path: this.path });
  }

  public validate = (booking: Booking): ValidatorError[] => {
    console;
    return [
      StringValidator.validate(`${this.path}.id`, booking?.id),
      StringValidator.validate(`${this.path}.uuid`, booking?.uuid),
      BooleanValidator.validate(`${this.path}.testMode`, booking?.testMode),
      StringValidator.validate(
        `${this.path}.resellerReference`,
        booking?.resellerReference,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.supplierReference`,
        booking?.supplierReference,
        { nullable: true }
      ),
      EnumValidator.validate(
        `${this.path}.status`,
        booking?.status,
        Object.values(BookingStatus)
      ),
      ...this.bookingStateValidator.validate(booking),
      StringValidator.validate(`${this.path}.productId`, booking?.productId),
      ...this.productValidator.validate(booking?.product),
      StringValidator.validate(`${this.path}.optionId`, booking?.optionId),
      ...this.optionValidator.validate(
        booking?.option,
        booking?.product?.availabilityType
      ),
      BooleanValidator.validate(
        `${this.path}.cancellable`,
        booking?.cancellable
      ),
      BooleanValidator.validate(`${this.path}.freesale`, booking?.freesale),
      ...this.validateBookingAvailability(booking),
      ...this.contactValidator.validate(booking?.contact),
      StringValidator.validate(`${this.path}.notes`, booking?.notes, {
        nullable: true,
      }),
      ...this.validateDeliveryMethods(booking),
      ...this.validateUnitItems(booking),
      ...this.validateVoucher(booking),
      ...this.validatePricingCapability(booking),
      ...this.validatePickupCapability(booking),
      ...this.ticketValidator.validate(booking?.voucher),
    ].filter(Boolean);
  };

  private validateVoucher = (booking: Booking): ValidatorError[] => {
    if ((booking?.deliveryMethods ?? []).includes(DeliveryMethod.VOUCHER)) {
      return this.ticketValidator.validate(booking?.voucher);
    }

    return [NullValidator.validate(`${this.path}.voucher`, booking?.voucher)];
  };

  private validateDeliveryMethods = (booking: Booking): ValidatorError[] => {
    const path = `${this.path}.deliveryMethods`;
    const errors = new Array<ValidatorError>();
    const deliveryMethodsValidated = EnumArrayValidator.validate(
      path,
      booking?.deliveryMethods,
      Object.values(DeliveryMethod)
    );
    if (deliveryMethodsValidated) {
      errors.push(deliveryMethodsValidated);
    }

    const deliveryMethodsMatch =
      booking?.deliveryMethods?.every((method) =>
        booking?.product?.deliveryMethods.includes(method)
      ) &&
      booking?.deliveryMethods?.length ===
        booking?.product?.deliveryMethods?.length;

    if (!deliveryMethodsMatch) {
      errors.push(
        new ValidatorError({
          message: `${path} does not match with ${this.path}.product.deliveryMethods`,
        })
      );
    }
    return errors;
  };

  private validateBookingAvailability = (booking: Booking): ValidatorError[] =>
    [
      CommonValidator.validateLocalDateTime(
        `${this.path}.availabilityId`,
        booking?.availabilityId
      ),
      CommonValidator.validateLocalDateTime(
        `${this.path}.availability.id`,
        booking?.availability?.id
      ),
      CommonValidator.validateLocalDateTime(
        `${this.path}.availability.localDateTimeStart`,
        booking?.availability?.localDateTimeStart
      ),
      CommonValidator.validateLocalDateTime(
        `${this.path}.availability.localDateTimeEnd`,
        booking?.availability?.localDateTimeEnd
      ),
      BooleanValidator.validate(
        `${this.path}.availability.allDay`,
        booking?.availability?.allDay
      ),
      ...CommonValidator.validateOpeningHours(
        `${this.path}.availability`,
        booking?.availability?.openingHours ?? []
      ),
    ].filter(Boolean);

  private validateUnitItems = (booking: Booking): ValidatorError[] => {
    const unitItems = booking?.unitItems ?? [];
    return unitItems
      .map((unitItem, i) => {
        const validator = new UnitItemValidator({
          path: `${this.path}.unitItems[${i}]`,
          capabilities: this.capabilities,
        });
        return validator.validate(
          unitItem,
          booking?.product?.pricingPer,
          booking?.deliveryMethods
        );
      })
      .flat(1)
      .filter(Boolean);
  };

  private validatePricingCapability = (booking: Booking): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pricing)) {
      return this.pricingValidator.validate(booking?.pricing);
    }
    return [];
  };

  private validatePickupCapability = (booking: Booking): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pickups)) {
      return this.pickupValidator.validate(booking);
    }
    return [];
  };
}
