import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";
import { BadRequestErrorValidator } from "../../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { Config } from "../../../config/Config";

export class BookingListBadRequestScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private bookingListScenarioHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({});

    const name = "List Bookings BAD_REQUEST (400 BAD_REQUEST)";
    const error = "Response should be BAD_REQUEST";

    return this.bookingListScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
