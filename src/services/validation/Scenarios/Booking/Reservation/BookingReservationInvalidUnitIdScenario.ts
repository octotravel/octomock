import { Booking } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { InvalidUnitIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidUnitIdErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Result } from "../../../api/types";

export class BookingReservationInvalidUnitIdScenario implements Scenario<any> {
  private result: Result<Booking>;
  constructor({ result }: { result: Result<Booking> }) {
    this.result = result;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const name = "Booking Reservation Invalid Unit ID (400 INVALID_UNIT_ID)";
    const error = "Response should be INVALID_UNIT_ID";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result: this.result,
        name,
      },
      error,
      new InvalidUnitIdErrorValidator()
    );
  };
}
