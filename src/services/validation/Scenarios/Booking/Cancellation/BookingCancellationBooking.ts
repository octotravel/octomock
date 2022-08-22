import { Booking, CapabilityId, DeliveryMethod } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { BookingCancellationScenarioHelper } from "../../../helpers/BookingCancellationScenarioHelper";

export class BookingCancellationBookingScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private deliveryMethods: DeliveryMethod[];
  private booking: Booking;
  constructor({
    apiClient,
    uuid,
    capabilities,
    deliveryMethods,
    booking,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.deliveryMethods = deliveryMethods;
    this.booking = booking;
  }
  private bookingCancellationScenarioHelper =
    new BookingCancellationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.cancelBooking({
      uuid: this.uuid,
      reason: "Reason for cancellation",
    });
    const name = `Booking Cancellation - Booking`;

    return this.bookingCancellationScenarioHelper.validateBookingCancellation(
      {
        ...result,
        name,
      },
      {
        capabilities: this.capabilities,
        deliveryMethods: this.deliveryMethods,
      },
      this.booking
    );
  };
}
