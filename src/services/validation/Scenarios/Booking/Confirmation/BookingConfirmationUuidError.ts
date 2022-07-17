import * as R from "ramda";
import { BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { InvalidProductIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";

export class BookingConfirmationUuidErrorScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private uuid: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    apiClient,
    uuid,
    unitItems,
  }: {
    apiClient: ApiClient;
    uuid: string;
    unitItems: BookingUnitItemSchema[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.unitItems = unitItems;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      unitItems: this.unitItems,
    });

    const name = "Booking confirmation with bad uuid";
    if (result) {
      return {
        name,
        success: false,
        errors: ["Should return INVALID_BOOKING_UUID"],
        data: result as null,
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(error);
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
