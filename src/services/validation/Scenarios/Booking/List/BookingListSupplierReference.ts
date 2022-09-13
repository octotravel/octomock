import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingListScenarioHelper } from "../../../helpers/BookingListScenarioHelper";

export class BookingListSupplierReferenceScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private supplierReference: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    supplierReference,
    capabilities,
  }: {
    apiClient: ApiClient;
    supplierReference: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.supplierReference = supplierReference;
    this.capabilities = capabilities;
  }
  private bookingListScenarionHelper = new BookingListScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getBookings({
      supplierReference: this.supplierReference,
    });
    const name = "List Bookings - Supplier Reference";

    return this.bookingListScenarionHelper.validateBookingList(
      {
        ...result,
        name,
      },
      {
        capabilities: this.capabilities,
        supplierReference: this.supplierReference,
      }
    );
  };
}
