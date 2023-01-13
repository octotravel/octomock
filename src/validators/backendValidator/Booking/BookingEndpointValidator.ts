import { GetBookingsSchema } from "./../../../schemas/Booking";
import {
  Booking,
  CreateBookingBodySchema,
  BookingStatus,
  ExtendBookingBodySchema,
  ConfirmBookingBodySchema,
  UpdateBookingBodySchema,
  CancelBookingBodySchema,
} from "@octocloud/types";
import { ArrayValidator, ErrorType, StringValidator, ValidatorError } from "../ValidatorHelpers";

interface ValidateData {
  booking: Booking;
  productId: string;
  optionId: string;
  availabilityId: string;
}

interface ValidateReservationData {
  reservation: Booking;
  schema: CreateBookingBodySchema;
}

interface ValidateReservationExtendData {
  reservation: Booking;
  reservationExtended: Booking;
  schema: ExtendBookingBodySchema;
}

interface ValidateConfirmationdData {
  reservation: Booking;
  booking: Booking;
  schema: ConfirmBookingBodySchema;
}

interface ValidateUpdateData {
  booking: Booking;
  bookingUpdated: Booking;
  schema: UpdateBookingBodySchema;
}

interface ValidateCancelData {
  booking: Booking;
  bookingCancelled: Booking;
  schema: CancelBookingBodySchema;
}

interface ValidateGetBookingsData {
  bookings: Booking[];
  schema: GetBookingsSchema;
}

export class BookingEndpointValidator {
  private path: string;
  constructor() {
    this.path = `booking`;
  }

  public validate = (data: ValidateData): ValidatorError[] => {
    const { booking, productId, optionId, availabilityId } = data;
    const errors = [
      StringValidator.validate(`${this.path}.productId`, booking?.productId, {
        equalsTo: productId,
      }),
      StringValidator.validate(`${this.path}.product.id`, booking?.product?.id, {
        equalsTo: productId,
      }),
      StringValidator.validate(`${this.path}.optionId`, booking?.optionId, {
        equalsTo: optionId,
      }),
      StringValidator.validate(`${this.path}.option.id`, booking?.option?.id, {
        equalsTo: optionId,
      }),
      StringValidator.validate(`${this.path}.availabilityId`, booking?.availabilityId, {
        equalsTo: availabilityId,
      }),
      StringValidator.validate(`${this.path}.availability.id`, booking?.availability?.id, {
        equalsTo: availabilityId,
      }),
    ];
    return errors.flatMap((v) => (v ? [v] : []));
  };

  public validateReservation = (data: ValidateReservationData) => {
    const reservation = data?.reservation;
    const schema = data?.schema;
    const errors = [
      StringValidator.validate(`${this.path}.status`, reservation?.status, {
        equalsTo: BookingStatus.ON_HOLD,
      }),
      ...this.validateUnitItems(reservation, schema),
    ];

    if (schema?.notes) {
      errors.push(
        StringValidator.validate(`${this.path}.notes`, reservation?.notes, {
          equalsTo: schema?.notes,
        })
      );
    }

    return errors.flatMap((v) => (v ? [v] : []));
  };

  private validateUnitItems = (
    booking: Booking,
    schema: CreateBookingBodySchema | ConfirmBookingBodySchema | UpdateBookingBodySchema
  ): ValidatorError[] => {
    const errors = [];
    const label = `${this.path}.unitItems`;
    if (schema?.unitItems) {
      if (booking?.unitItems?.length !== schema?.unitItems?.length) {
        errors.push(
          new ValidatorError({
            type: ErrorType.CRITICAL,
            message: `${label} field must have ${schema?.unitItems?.length} items`,
          })
        );
      }

      const unitIds = schema?.unitItems.map((i) => i.unitId);
      const bookingUnitIds = booking?.unitItems.map((i) => i.unitId);
      const unitIdMatches = booking?.unitItems.reduce((acc, unitItem) => {
        return acc && unitIds.includes(unitItem?.unitId);
      }, true);
      if (!unitIdMatches) {
        errors.push(
          new ValidatorError({
            type: ErrorType.CRITICAL,
            message: `${label} field must contain these unitIds: ${unitIds.toString()}, but the provded unitIds are: ${bookingUnitIds.toString()}`,
          })
        );
      }
    }

    return errors;
  };

  public validateReservationExtend = (data: ValidateReservationExtendData): ValidatorError[] => {
    const reservation = data?.reservation;
    const reservationExtended = data?.reservationExtended;
    const schema = data?.schema;
    const errors = [
      StringValidator.validate(`${this.path}.status`, reservation?.status, {
        equalsTo: BookingStatus.ON_HOLD,
      }),
    ];
    if (reservation?.utcExpiresAt >= reservationExtended?.utcExpiresAt) {
      errors.push(
        new ValidatorError({
          type: ErrorType.WARNING,
          message: `${this.path}.utcExpiresAt has to be extended by ${schema?.expirationMinutes} minutes. Provided value was: "${reservationExtended?.utcExpiresAt}" Previous value of booking.utcExpiresAt was: "${reservation?.utcExpiresAt}"`,
        })
      );
    }

    return errors.flatMap((v) => (v ? [v] : []));
  };

  public validateConfirmation = (data: ValidateConfirmationdData): ValidatorError[] => {
    const booking = data?.booking;
    const schema = data?.schema;

    const errors = [
      StringValidator.validate(`${this.path}.resellerReference`, booking?.resellerReference, {
        equalsTo: schema?.resellerReference,
      }),
      StringValidator.validate(`${this.path}.status`, booking?.status, {
        equalsTo: BookingStatus.CONFIRMED,
      }),
      ...this.validateContact(booking, schema),
    ];

    if (schema?.unitItems) {
      errors.push(...this.validateUnitItems(booking, schema));
    }
    return errors.flatMap((v) => (v ? [v] : []));
  };

  public validateUpdate = (data: ValidateUpdateData): ValidatorError[] => {
    const bookingUpdated = data?.bookingUpdated;
    const schema = data?.schema;
    const errors = [
      ...this.validateContact(bookingUpdated, schema),
      ...this.validateUnitItems(bookingUpdated, schema),
    ];

    if (schema?.notes) {
      errors.push(
        StringValidator.validate(`${this.path}.notes`, bookingUpdated?.notes, {
          equalsTo: schema?.notes,
        })
      );
    }

    return errors.flatMap((v) => (v ? [v] : []));
  };

  private validateContact = (
    booking: Booking,
    schema: ConfirmBookingBodySchema | UpdateBookingBodySchema
  ) => {
    if (schema.contact) {
      const errors = [
        StringValidator.validate(`${this.path}.contact.firstName`, booking?.contact?.firstName, {
          equalsTo: schema?.contact?.firstName,
        }),
        StringValidator.validate(`${this.path}.contact.fullName`, booking?.contact?.fullName, {
          equalsTo: schema?.contact?.fullName,
        }),
        StringValidator.validate(`${this.path}.contact.lastName`, booking?.contact?.lastName, {
          equalsTo: schema?.contact?.lastName,
        }),
        StringValidator.validate(
          `${this.path}.contact.emailAddress`,
          booking?.contact?.emailAddress,
          {
            equalsTo: schema?.contact?.emailAddress,
          }
        ),
        StringValidator.validate(`${this.path}.contact.notes`, booking?.contact?.notes, {
          equalsTo: schema?.contact?.notes,
        }),
      ];
      return errors.flatMap((v) => (v ? [v] : []));
    }

    return [];
  };

  public validateCancel = (data: ValidateCancelData): ValidatorError[] => {
    const bookingCancelled = data?.bookingCancelled;
    const schema = data?.schema;
    const errors = [
      StringValidator.validate(
        `${this.path}.cancellation.reason`,
        bookingCancelled?.cancellation?.reason,
        {
          equalsTo: schema?.reason,
        }
      ),
    ];
    if (data?.booking?.status === BookingStatus.ON_HOLD) {
      errors.push(
        StringValidator.validate(`${this.path}.status`, bookingCancelled?.status, {
          equalsTo: BookingStatus.EXPIRED,
        })
      );
    } else if (data?.booking?.status === BookingStatus.CONFIRMED) {
      errors.push(
        StringValidator.validate(`${this.path}.status`, bookingCancelled?.status, {
          equalsTo: BookingStatus.CANCELLED,
        })
      );
    }

    return errors.flatMap((v) => (v ? [v] : []));
  };

  public validateGetBookings = (data: ValidateGetBookingsData): ValidatorError[] => {
    const bookings = data?.bookings ?? [];
    const schema = data?.schema;

    const errors = [ArrayValidator.validate(`bookings`, bookings, { min: 1 })];

    if (schema?.resellerReference) {
      errors.push(
        ...bookings.map((booking, i) =>
          StringValidator.validate(`bookings[${i}].resellerReference`, booking.resellerReference, {
            equalsTo: schema?.resellerReference,
          })
        )
      );
    }

    if (schema?.supplierReference) {
      errors.push(
        ...bookings.map((booking, i) =>
          StringValidator.validate(`bookings[${i}].supplierReference`, booking.supplierReference, {
            equalsTo: schema?.supplierReference,
          })
        )
      );
    }

    return errors.flatMap((v) => (v ? [v] : []));
  };
}
