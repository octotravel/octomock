import { BookingUnitItemSchema, Contact, UnitType } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingGetReservationScenario } from "../../Scenarios/Booking/Get/BookingGetReservation";
import { BookingGetBookingScenario } from "../../Scenarios/Booking/Get/BookingGetBooking";
import { BookingGetInvalidUUIDScenario } from "../../Scenarios/Booking/Get/BookingGetInvalidUUID";
import { BaseFlow } from "../BaseFlow";

export class BookingGetFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Get Booking");
  }
  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.validateGetBookingReservation(),
      await this.validateGetBookingBooking(),
      await this.validateGetBookingInvalidUUIDError(),
    ];
    return this.validateScenarios(scenarios);
  };

  private validateGetBookingReservation =
    async (): Promise<BookingGetReservationScenario> => {
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
      return new BookingGetReservationScenario({
        uuid: booking.uuid,
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateGetBookingBooking =
    async (): Promise<BookingGetBookingScenario> => {
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
      return new BookingGetBookingScenario({
        uuid: booking.uuid,
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateGetBookingInvalidUUIDError =
    async (): Promise<BookingGetInvalidUUIDScenario> => {
      return new BookingGetInvalidUUIDScenario({
        uuid: "invalid_UUID",
        capabilities: this.config.getCapabilityIDs(),
      });
    };
}
