import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingGetScenarioHelper } from "../../../helpers/BookingGetScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingGetBookingScenario implements Scenario<Booking> {
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
    const name = "Get Booking - Booking";

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
