import { Booking, CapabilityId, DeliveryMethod } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingExtendScenarioHelper } from "../../../helpers/BookingExtendScenarioHelper";

export class BookingReservationExtendScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private booking: Booking;
  private availabilityType: string;
  private deliveryMethods: DeliveryMethod[];
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    booking,
    availabilityType,
    deliveryMethods,
    capabilities,
  }: {
    apiClient: ApiClient;
    booking: Booking;
    availabilityType: string;
    deliveryMethods: DeliveryMethod[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.availabilityType = availabilityType;
    this.booking = booking;
    this.deliveryMethods = deliveryMethods;
    this.capabilities = capabilities;
  }
  private bookingExtendScenarioHelper = new BookingExtendScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingExtend({
      uuid: this.booking.uuid,
      expirationMinutes: 31,
    });
    const name = `Extend Reservation (${this.availabilityType})`;

    return this.bookingExtendScenarioHelper.validateBookingExtend(
      {
        result,
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
