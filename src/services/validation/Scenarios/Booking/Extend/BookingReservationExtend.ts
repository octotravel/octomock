import { Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingExtendScenarioHelper } from "../../../helpers/BookingExtendScenarioHelper";

export class BookingReservationExtendScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private booking: Booking;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    booking,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    booking: Booking;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.availabilityType = availabilityType;
    this.booking = booking;
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
      },
      this.booking
    );
  };
}
