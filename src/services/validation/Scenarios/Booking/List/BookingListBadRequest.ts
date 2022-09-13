import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";
import { BadRequestErrorValidator } from "../../../../../validators/backendValidator/Error/BadRequestErrorValidator";

export class BookingListBadRequestScenario implements Scenario<any> {
  private apiClient: ApiClient;
  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.apiClient = apiClient;
  }
  private bookingListScenarioHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({});

    const name = "List Bookings BAD_REQUEST (400 BAD_REQUEST)";
    const error = "Response should be BAD_REQUEST";

    return this.bookingListScenarioHelper.validateBookingListError(
      {
        result,
        name,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
