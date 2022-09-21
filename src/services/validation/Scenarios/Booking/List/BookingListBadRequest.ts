import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";
import { BadRequestErrorValidator } from "../../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingListBadRequestScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private bookingListScenarioHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({});

    const name = "List Bookings BAD_REQUEST (400 BAD_REQUEST)";
    const error = "Response should be BAD_REQUEST";
    const description = descriptions.bookingListBadRequest;

    return this.bookingListScenarioHelper.validateError(
      {
        result,
        name,
        description,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
