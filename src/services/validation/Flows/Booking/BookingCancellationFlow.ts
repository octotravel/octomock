import { BookingUnitItemSchema, Contact, UnitType } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingCancellationReservationScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationReservation";
import { BookingCancellationBookingScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationBooking";
import { BookingCancellationInvalidUUIDScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationInvalidUUID";
import { BaseFlow } from "../BaseFlow";

export class BookingCancellationFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Booking Cancellation");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.validateBookingCancellationReservation(),
      await this.validateBookingCancellationBooking(),
      await this.validateBookingCancellationInvalidUUID(),
    ];

    return this.validateScenarios(scenarios);
  };

  private validateBookingCancellationReservation =
    async (): Promise<BookingCancellationReservationScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const result = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
      const booking = result.data;
      return new BookingCancellationReservationScenario({
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private validateBookingCancellationBooking =
    async (): Promise<BookingCancellationBookingScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const reservationResult = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
      const reservation = reservationResult.data;

      const result = await this.apiClient.bookingConfirmation({
        uuid: reservation.id,
        // TODO: create legit contact
        contact: {} as Contact,
      });
      const booking = result.data;
      return new BookingCancellationBookingScenario({
        capabilities: this.config.getCapabilityIDs(),
        booking: booking,
      });
    };

  private validateBookingCancellationInvalidUUID =
    async (): Promise<BookingCancellationInvalidUUIDScenario> => {
      return new BookingCancellationInvalidUUIDScenario({
        uuid: "invalid_UUID",
      });
    };
}
