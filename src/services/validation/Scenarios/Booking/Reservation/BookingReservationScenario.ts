import { Result } from "./../../../api/types";
import { Booking } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingReservationScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private result: Result<Booking>;
  constructor({ result }: { result: Result<Booking> }) {
    this.result = result;
  }
  private bookingReservationScenarioHelper = new BookingReservationScenarioHelper();
  public validate = async () => {
    const name = `Booking Reservation`;
    const description = descriptions.bookingReservation;

    return this.bookingReservationScenarioHelper.validateBookingReservation(
      {
        result: this.result,
        name,
        description,
      },
      {
        capabilities: this.config.getCapabilityIDs(),
      }
    );
  };
}
