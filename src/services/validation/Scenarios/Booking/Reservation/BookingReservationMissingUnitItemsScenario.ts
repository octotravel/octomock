import { Booking } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Result } from "../../../api/types";

export class BookingReservationMissingUnitItemsScenario
  implements Scenario<any>
{
  private result: Result<Booking>;
  constructor({ result }: { result: Result<Booking> }) {
    this.result = result;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const name =
      "Booking Reservation Missing UnitItems (400 UNPROCESSABLE_ENTITY)";
    const error = "Response should be UNPROCESSABLE_ENTITY";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result: this.result,
        name,
      },
      error,
      new UnprocessableEntityErrorValidator()
    );
  };
}
