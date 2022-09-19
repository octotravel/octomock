import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingCancellationBookingScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private capabilities: CapabilityId[];
  private booking: Booking;
  constructor({
    capabilities,
    booking,
  }: {
    capabilities: CapabilityId[];
    booking: Booking;
  }) {
    this.capabilities = capabilities;
    this.booking = booking;
  }
  private bookingCancellationScenarioHelper =
    new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.booking.uuid,
      reason: "Reason for cancellation",
    });
    const name = `Booking Cancellation - Booking`;
    const description = descriptions.bookingCancellationBooking;

    return this.bookingCancellationScenarioHelper.validateBookingCancellation(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
