import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { Config } from "../../../config/Config";
import { BookingGetScenarioHelper } from "../../../helpers/BookingGetScenarioHelper";

export class BookingGetReservationScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private uuid: string;
  private capabilities: CapabilityId[];
  constructor({
    uuid,
    capabilities,
  }: {
    uuid: string;
    capabilities: CapabilityId[];
  }) {
    this.uuid = uuid;
    this.capabilities = capabilities;
  }
  private bookingGetScenarionHelper = new BookingGetScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBooking({
      uuid: this.uuid,
    });
    const name = "Get Booking - Reservation";

    return this.bookingGetScenarionHelper.validateBookingGet(
      {
        result,
        name,
      },
      {
        capabilities: this.capabilities,
      }
    );
  };
}
