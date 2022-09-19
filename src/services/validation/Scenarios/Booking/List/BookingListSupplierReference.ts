import { Booking, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingListSupplierReferenceScenario
  implements Scenario<Booking[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private supplierReference: string;
  private capabilities: CapabilityId[];
  constructor({
    supplierReference,
    capabilities,
  }: {
    supplierReference: string;
    capabilities: CapabilityId[];
  }) {
    this.supplierReference = supplierReference;
    this.capabilities = capabilities;
  }
  private bookingListScenarionHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({
      supplierReference: this.supplierReference,
    });
    const name = "List Bookings - Supplier Reference";
    const description = descriptions.bookingListSupplierReference;

    return this.bookingListScenarionHelper.validateBookingList(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
        supplierReference: this.supplierReference,
      }
    );
  };
}
