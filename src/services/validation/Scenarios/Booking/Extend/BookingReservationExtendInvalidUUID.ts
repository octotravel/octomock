import { Scenario } from "../../Scenario";
import { BookingExtendScenarioHelper } from "../../../helpers/BookingExtendScenarioHelper";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
import { Config } from "../../../config/Config";

export class BookingReservationExtendInvalidUUIDScenario
  implements Scenario<any>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private uuid: string;
  constructor({ uuid }: { uuid: string }) {
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

    return this.bookingExtendScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new InvalidBookingUUIDErrorValidator()
    );
  };
}
