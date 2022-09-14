import {
  Booking,
  BookingUnitItemSchema,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";

export class BookingUpdateProductScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private capabilities: CapabilityId[];
  private booking: Booking;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    apiClient,
    uuid,
    capabilities,
    booking,
    productId,
    optionId,
    availabilityId,
    unitItems,
  }: {
    apiClient: ApiClient;
    uuid: string;
    capabilities: CapabilityId[];
    deliveryMethods: DeliveryMethod[];
    booking: Booking;
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.capabilities = capabilities;
    this.booking = booking;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.uuid,
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });
    const name = `Booking Update - Change Product`;

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
