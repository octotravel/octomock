import { Contact } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingGetReservationScenario } from "../../Scenarios/Booking/Get/BookingGetReservation";
import { BookingGetBookingScenario } from "../../Scenarios/Booking/Get/BookingGetBooking";
import { BookingGetInvalidUUIDScenario } from "../../Scenarios/Booking/Get/BookingGetInvalidUUID";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";
import docs from "../../consts/docs";

export class BookingGetFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  private booker = new Booker();
  constructor() {
    super("Get Booking", docs.bookingGet);
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
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct);
      const booking = result.data;
      return new BookingGetReservationScenario({
        uuid: booking.uuid,
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateGetBookingBooking =
    async (): Promise<BookingGetBookingScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const reservationResult = await this.booker.createReservation(
        bookableProduct
      );
      const reservation = reservationResult.data;

      const result = await this.apiClient.bookingConfirmation({
        uuid: reservation.uuid,
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
        uuid: this.config.invalidUUID,
        capabilities: this.config.getCapabilityIDs(),
      });
    };
}
