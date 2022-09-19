import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingListResellerReferenceScenario
  implements Scenario<Booking[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private resellerReference: string;
  private capabilities: CapabilityId[];
  constructor({
    resellerReference,
    capabilities,
  }: {
    resellerReference: string;
    capabilities: CapabilityId[];
  }) {
    this.resellerReference = resellerReference;
    this.capabilities = capabilities;
  }
  private bookingListScenarionHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({
      resellerReference: this.resellerReference,
    });
    const name = "List Bookings - Reseller Reference";
    const description = descriptions.bookingListResellerReference;

    return this.bookingListScenarionHelper.validateBookingList(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
        resellerReference: this.resellerReference,
      }
    );
  };
}
