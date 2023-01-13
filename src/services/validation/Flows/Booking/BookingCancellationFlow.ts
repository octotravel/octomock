import { Contact } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingCancellationReservationScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationReservation";
import { BookingCancellationBookingScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationBooking";
import { BookingCancellationInvalidUUIDScenario } from "../../Scenarios/Booking/Cancellation/BookingCancellationInvalidUUID";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";
import docs from "../../consts/docs";

export class BookingCancellationFlow extends BaseFlow implements Flow {
  private booker = new Booker();
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Booking Cancellation", docs.bookingCancellation);
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
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct);
      const booking = result.data;
      return new BookingCancellationReservationScenario({
        booking,
      });
    };

  private validateBookingCancellationBooking =
    async (): Promise<BookingCancellationBookingScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const reservationResult = await this.booker.createReservation(bookableProduct);
      const reservation = reservationResult.data;

      // TODO: add confirmReservation to Booker
      const result = await this.apiClient.bookingConfirmation({
        uuid: reservation.uuid,
        // TODO: create legit contact
        contact: {} as Contact,
      });

      const booking = result.data;
      return new BookingCancellationBookingScenario({
        booking: booking,
      });
    };

  private validateBookingCancellationInvalidUUID =
    async (): Promise<BookingCancellationInvalidUUIDScenario> => {
      return new BookingCancellationInvalidUUIDScenario({
        uuid: this.config.invalidUUID,
      });
    };
}
