import {
  AvailabilityType,
  Booking,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";

export class BookingConfirmationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private availabilityType: AvailabilityType;
  private capabilities: CapabilityId[];
  private deliveryMethods: DeliveryMethod[];
  private booking: Booking;
  constructor({
    apiClient,
    uuid,
    availabilityType,
    capabilities,
    deliveryMethods,
    booking,
  }: {
    apiClient: ApiClient;
    uuid: string;
    availabilityType: AvailabilityType;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
    this.deliveryMethods = deliveryMethods;
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
      resellerReference: "ResellerRef#1",
    });
    const name = `Booking Confirmation (${this.availabilityType})`;

    return this.bookingConfirmationScenarioHelper.validateBookingConfirmation(
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
