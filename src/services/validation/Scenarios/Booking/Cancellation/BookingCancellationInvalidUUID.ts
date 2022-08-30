import { CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";

export class BookingCancellationInvalidUUIDScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private uuid: string;
  constructor({
    apiClient,
    uuid,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
  }
  private bookingCancellationScenarioHelper =
    new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.uuid,
    });

    const name =
      "Booking Cancellation Invalid Booking UUID (400 INVALID_BOOKING_UUID)";
    const error = "Response should be INVALID_BOOKING_UUID";

    return this.bookingCancellationScenarioHelper.validateBookingCancellationError(
      {
        ...result,
        name,
      },
      error,
      new InvalidBookingUUIDErrorValidator()
    );
  };
}
