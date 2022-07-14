import * as R from "ramda";
import { BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";

export class BookingReservationEntityErrorScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityId,
    unitItems,
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
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });

    const name = "Booking reservation with less then minimum units";
    if (result) {
      return {
        name,
        success: false,
        errors: [],
        data: null,
      };
    }

    const errors = new UnprocessableEntityErrorValidator().validate(error);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: null,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: null,
    };
  };
}
