import { Scenario } from "../../Scenario";
import { InvalidProductIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Booking } from "@octocloud/types";
import { Result } from "../../../api/types";

export class BookingReservationInvalidProductScenario implements Scenario<any> {
  private result: Result<Booking>;
  constructor({ result }: { result: Result<Booking> }) {
    this.result = result;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const name = "Booking Reservation Invalid Product (400 INVALID_PRODUCT_ID)";
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result: this.result,
        name,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
