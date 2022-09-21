import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingUpdateDateScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private booking: Booking;
  private availabilityId: string;
  constructor({
    booking,
    availabilityId,
  }: {
    capabilities: CapabilityId[];
    booking: Booking;
    availabilityId: string;
  }) {
    this.booking = booking;
    this.availabilityId = availabilityId;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.booking.uuid,
      availabilityId: this.availabilityId,
    });
    const name = `Booking Update - Change Date`;
    const description = descriptions.bookingUpdateDate;

    return this.bookingUpdateScenarioHelper.validateBookingUpdate(
      {
        result,
        name,
        description,
      },
      this.booking
    );
  };
}
