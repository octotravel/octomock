import {
  Booking,
  BookingUnitItemSchema,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";

export class BookingUpdateUnitItemsScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private deliveryMethods: DeliveryMethod[];
  private booking: Booking;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    apiClient,
    uuid,
    capabilities,
    deliveryMethods,
    booking,
    unitItems,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
    unitItems: BookingUnitItemSchema[];
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.deliveryMethods = deliveryMethods;
    this.booking = booking;
    this.unitItems = unitItems;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.uuid,
      unitItems: this.unitItems,
    });
    const name = `Booking Update - Unit Items`;

    return this.bookingUpdateScenarioHelper.validateBookingUpdate(
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
