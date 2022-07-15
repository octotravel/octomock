import * as R from "ramda";
import { BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { InvalidOptionIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";

export class BookingReservationOptionIdErrorScenario implements Scenario<null> {
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

    const name = "Booking reservation with bad optionId";
    if (result) {
      return {
        name,
        success: false,
        errors: ["Should return INVALID_OPTION_ID"],
        data: result as null,
      };
    }

    const errors = new InvalidOptionIdErrorValidator().validate(error);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: error as null,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: error as null,
    };
  };
}
