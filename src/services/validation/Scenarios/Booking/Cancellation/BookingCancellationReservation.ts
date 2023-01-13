import { Booking } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingCancellationReservationScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private booking: Booking;
  constructor({ booking }: { booking: Booking }) {
    this.booking = booking;
  }
  private bookingCancellationScenarioHelper = new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.booking.uuid,
      reason: "Reason for cancellation",
    });
    const name = `Booking Cancellation - Reservation`;
    const description = descriptions.bookingCancellationReservation;

    return this.bookingCancellationScenarioHelper.validateBookingCancellation(
      {
        result,
        name,
        description,
      },
      this.booking
    );
  };
}
