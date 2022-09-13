import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingExtendScenarioHelper } from "../../../helpers/BookingExtendScenarioHelper";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";

export class BookingReservationExtendInvalidUUIDScenario
  implements Scenario<any>
{
  private apiClient: ApiClient;
  private uuid: string;
  constructor({ apiClient, uuid }: { apiClient: ApiClient; uuid: string }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
  }
  private bookingExtendScenarioHelper = new BookingExtendScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingExtend({
      uuid: this.uuid,
      expirationMinutes: 31,
    });

    const name = "Extend Reservation Invalid UUID (INVALID_BOOKING_UUID)";
    const error = "Response should be INVALID_BOOKING_UUID";

    return this.bookingExtendScenarioHelper.validateBookingReservationError(
      {
        result,
        name,
      },
      error,
      new InvalidBookingUUIDErrorValidator()
    );
  };
}
