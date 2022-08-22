import { BookingContactSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";

export class BookingCancellationInvalidUUIDScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private uuid: string;
  private contact: BookingContactSchema;
  constructor({
    apiClient,
    uuid,
    contact,
  }: {
    apiClient: ApiClient;
    uuid: string;
    contact: BookingContactSchema;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.contact = contact;
    this.uuid = uuid;
  }
  private bookingCancellationScenarioHelper =
    new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      contact: this.contact,
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
