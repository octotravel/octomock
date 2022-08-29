import {
  Booking,
  BookingUnitItemSchema,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";

export class BookingReservationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  private notes: string;
  private pickupPointId: string;
  private availabilityType: string;
  private deliveryMethods: DeliveryMethod[];
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityId,
    unitItems,
    notes,
    pickupPointId,
    availabilityType,
    deliveryMethods,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
    notes?: string;
    pickupPointId?: string;
    availabilityType: string;
    deliveryMethods: DeliveryMethod[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
    this.notes = notes;
    this.pickupPointId = pickupPointId;
    this.availabilityType = availabilityType;
    this.deliveryMethods = deliveryMethods;
    this.capabilities = capabilities;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();
  private addPickupsCapability = (pickupPointId?: string) => {
    if (pickupPointId) {
      return {
        pickupRequested: true,
        pickupPointId,
      };
    }
    return {};
  };

  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
      notes: this.notes,
      ...this.addPickupsCapability(this.pickupPointId),
    });
    const name = `Booking Reservation (${this.availabilityType})`;

    return this.bookingReservationScenarioHelper.validateBookingReservation(
      {
        ...result,
        name,
      },
      {
        capabilities: this.capabilities,
        deliveryMethods: this.deliveryMethods,
      }
    );
  };
}
