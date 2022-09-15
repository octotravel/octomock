import { Booking, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingUpdateUnitItemsScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private capabilities: CapabilityId[];
  private booking: Booking;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    capabilities,
    booking,
    unitItems,
  }: {
    capabilities: CapabilityId[];
    booking: Booking;
    unitItems: BookingUnitItemSchema[];
  }) {
    this.capabilities = capabilities;
    this.booking = booking;
    this.unitItems = unitItems;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.booking.uuid,
      unitItems: this.unitItems,
    });
    const name = `Booking Update - Unit Items`;

    return this.bookingUpdateScenarioHelper.validateBookingUpdate(
      {
        result,
        name,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
