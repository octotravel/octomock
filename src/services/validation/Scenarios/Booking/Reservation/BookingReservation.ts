import * as R from "ramda";
import { Booking, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { BookingValidator } from "../../../../../validators/backendValidator/Booking/BookingValidator";

export class BookingReservationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityId,
    unitItems,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });
    const name = "Correct booking reservation";
    if (error) {
      return {
        name,
        success: false,
        errors: [],
        data: result,
      };
    }

    const errors = new BookingValidator({
      capabilities: this.capabilities,
    }).validate(result);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: result,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: result,
    };
  };
}
