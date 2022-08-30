import { CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
import { BookingGetScenarioHelper } from "../../../helpers/BookingGetScenarioHelper";

export class BookingGetInvalidUUIDScenario implements Scenario<null> {
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
  private bookingGetScenarioHelper = new BookingGetScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBooking({
      uuid: this.uuid,
    });

    const name = "Get Booking Invalid Booking UUID (400 INVALID_BOOKING_UUID)";
    const error = "Response should be INVALID_BOOKING_UUID";

    return this.bookingGetScenarioHelper.validateBookingGetError(
      {
        ...result,
        name,
      },
      error,
      new InvalidBookingUUIDErrorValidator()
    );
  };
}
