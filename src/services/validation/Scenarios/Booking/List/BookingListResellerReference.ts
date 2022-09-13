import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";

export class BookingListResellerReferenceScenario
  implements Scenario<Booking[]>
{
  private apiClient: ApiClient;
  private resellerReference: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    resellerReference,
    capabilities,
  }: {
    apiClient: ApiClient;
    resellerReference: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.resellerReference = resellerReference;
    this.capabilities = capabilities;
  }
  private bookingListScenarionHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({
      resellerReference: this.resellerReference,
    });
    const name = "List Bookings - Reseller Reference";

    return this.bookingListScenarionHelper.validateBookingList(
      {
        result,
        name,
      },
      {
        capabilities: this.capabilities,
        resellerReference: this.resellerReference,
      }
    );
  };
}
