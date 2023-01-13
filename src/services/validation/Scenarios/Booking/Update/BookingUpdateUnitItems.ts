import { Booking, BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingUpdateUnitItemsScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private booking: Booking;
  private unitItems: BookingUnitItemSchema[];
  constructor({ booking, unitItems }: { booking: Booking; unitItems: BookingUnitItemSchema[] }) {
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
    const description = descriptions.bookingUpdateUnitItems;

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
