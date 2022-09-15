import { BookingUnitItemSchema, UnitType } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingReservationExtendScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtend";
import { BookingReservationExtendInvalidUUIDScenario } from "../../Scenarios/Booking/Extend/BookingReservationExtendInvalidUUID";
import { BaseFlow } from "../BaseFlow";

export class BookingExtendFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Extend Reservation");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.extendBooking(),
      await this.extendBookingWithInvalidUUID(),
    ];
    return this.validateScenarios(scenarios);
  };

  private extendBooking =
    async (): Promise<BookingReservationExtendScenario> => {
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
      return new BookingReservationExtendScenario({
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private extendBookingWithInvalidUUID =
    async (): Promise<BookingReservationExtendInvalidUUIDScenario> => {
      return new BookingReservationExtendInvalidUUIDScenario({
        uuid: "invalid_booking_UUID",
      });
    };
}
