import * as R from "ramda";
import { Booking, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { BookingValidator } from "../../../../../validators/backendValidator/Booking/BookingValidator";

export class BookingConfirmationScenario implements Scenario<Booking> {
  private apiClient: ApiClient;
  private uuid: string;
  private unitItems: BookingUnitItemSchema[];
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    uuid,
    unitItems,
    capabilities,
  }: {
    apiClient: ApiClient;
    uuid: string;
    unitItems: BookingUnitItemSchema[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.uuid = uuid;
    this.unitItems = unitItems;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      unitItems: this.unitItems,
    });
    const name = "Correct booking confirmation";
    if (error) {
      const data = error as unknown;
      return {
        name,
        success: false,
        errors: [error.body.errorMessage as string],
        data: data as Booking,
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
