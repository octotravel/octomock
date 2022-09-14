import { AvailabilityType, Booking, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";

export class BookingConfirmationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private availabilityType: AvailabilityType;
  private capabilities: CapabilityId[];
  private booking: Booking;
  constructor({
    apiClient,
    uuid,
    availabilityType,
    capabilities,
    booking,
  }: {
    apiClient: ApiClient;
    uuid: string;
    availabilityType: AvailabilityType;
    capabilities: CapabilityId[];
    booking: Booking;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
    this.booking = booking;
  }
  private bookingConfirmationScenarioHelper =
    new BookingConfirmationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      contact: {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "johndoe@mail.com",
        fullName: "John Doe",
        notes: "Test note",
      },
      resellerReference: "RESELLERREF#1",
    });
    const name = `Booking Confirmation (${this.availabilityType})`;

    return this.bookingConfirmationScenarioHelper.validateBookingConfirmation(
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
