import {
  Booking,
  BookingContactSchema,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";

export class BookingUpdateContactScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private deliveryMethods: DeliveryMethod[];
  private booking: Booking;
  private contact: BookingContactSchema;
  private notes: string;
  constructor({
    apiClient,
    uuid,
    capabilities,
    deliveryMethods,
    booking,
    contact,
    notes,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
    contact: BookingContactSchema;
    notes: string;
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.deliveryMethods = deliveryMethods;
    this.booking = booking;
    this.contact = contact;
    this.notes = notes;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.uuid,
      contact: this.contact,
      notes: this.notes,
    });
    const name = `Booking Update - Contact`;

    return this.bookingUpdateScenarioHelper.validateBookingUpdate(
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
