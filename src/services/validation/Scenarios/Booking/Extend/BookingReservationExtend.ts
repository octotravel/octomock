import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingExtendScenarioHelper } from "../../../helpers/BookingExtendScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingReservationExtendScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private booking: Booking;
  private capabilities: CapabilityId[];
  constructor({
    booking,
    capabilities,
  }: {
    booking: Booking;
    capabilities: CapabilityId[];
  }) {
    this.booking = booking;
    this.capabilities = capabilities;
  }
  private bookingExtendScenarioHelper = new BookingExtendScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingExtend({
      uuid: this.booking.uuid,
      expirationMinutes: 31,
    });
    const name = `Extend Reservation`;
    const description = descriptions.bookingReservationExtend;

    return this.bookingExtendScenarioHelper.validateBookingExtend(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
