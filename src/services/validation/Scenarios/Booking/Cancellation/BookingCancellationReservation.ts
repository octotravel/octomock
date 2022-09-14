import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";

export class BookingCancellationReservationScenario
  implements Scenario<Booking>
{
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private booking: Booking;
  constructor({
    apiClient,
    uuid,
    capabilities,
    booking,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    booking: Booking;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.booking = booking;
  }
  private bookingCancellationScenarioHelper =
    new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.uuid,
      reason: "Reason for cancellation",
    });
    const name = `Booking Cancellation - Reservation`;

    return this.bookingCancellationScenarioHelper.validateBookingCancellation(
      {
        result,
        name,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
