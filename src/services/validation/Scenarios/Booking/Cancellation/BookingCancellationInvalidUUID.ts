import { Scenario } from "../../Scenario";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingCancellationInvalidUUIDScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private uuid: string;
  constructor({ uuid }: { uuid: string }) {
    this.uuid = uuid;
  }
  private bookingCancellationScenarioHelper = new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.uuid,
    });

    const name = "Booking Cancellation Invalid Booking UUID (400 INVALID_BOOKING_UUID)";
    const error = "Response should be INVALID_BOOKING_UUID";
    const description = descriptions.invalidUUID;

    return this.bookingCancellationScenarioHelper.validateError(
      {
        result,
        name,
        description,
      },
      error,
      new InvalidBookingUUIDErrorValidator()
    );
  };
}
