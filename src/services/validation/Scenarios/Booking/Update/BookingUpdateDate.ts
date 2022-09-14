import { Booking, CapabilityId, DeliveryMethod } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";

export class BookingUpdateDateScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private booking: Booking;
  private availabilityId: string;
  constructor({
    apiClient,
    uuid,
    capabilities,
    booking,
    availabilityId,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
    availabilityId: string;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.booking = booking;
    this.availabilityId = availabilityId;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.uuid,
      availabilityId: this.availabilityId,
    });
    const name = `Booking Update - Change Date`;

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
