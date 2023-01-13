import { InvalidAvailabilityIdErrorValidator } from "./../../../../../validators/backendValidator/Error/InvalidAvailabilityIdErrorValidator";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Booking } from "@octocloud/types";
import { Result } from "../../../api/types";
import descriptions from "../../../consts/descriptions";

export class BookingReservationInvalidAvailabilityIdScenario implements Scenario<any> {
  private result: Result<Booking>;
  constructor({ result }: { result: Result<Booking> }) {
    this.result = result;
  }
  private bookingReservationScenarioHelper = new BookingReservationScenarioHelper();

  public validate = async () => {
    const name = "Booking Reservation Invalid Availability ID (400 INVALID_AVAILABILITY_ID)";
    const error = "Response should be INVALID_AVAILABILITY_ID";
    const description = descriptions.bookingReservationInvalidAvailabilityId;

    return this.bookingReservationScenarioHelper.validateError(
      {
        result: this.result,
        name,
        description,
      },
      error,
      new InvalidAvailabilityIdErrorValidator()
    );
  };
}
