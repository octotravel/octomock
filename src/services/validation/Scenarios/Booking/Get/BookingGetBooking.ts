import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingGetScenarioHelper } from "../../../helpers/BookingGetScenarioHelper";

export class BookingGetBookingScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    uuid,
    capabilities,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
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
