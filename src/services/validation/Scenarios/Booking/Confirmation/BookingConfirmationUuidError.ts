import * as R from "ramda";
import { BookingContactSchema, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../../ApiClient";
import { Scenario } from "../../../Scenario";
import { InvalidBookingUUIDErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidBookingUUIDErrorValidator";

export class BookingConfirmationUuidErrorScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private uuid: string;
  private contact: BookingContactSchema;
  constructor({
    apiClient,
    uuid,
    contact,
  }: {
    apiClient: ApiClient;
    uuid: string;
    contact: BookingContactSchema;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.contact = contact;
    this.uuid = uuid;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      contact: this.contact,
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

    const errors = new InvalidBookingUUIDErrorValidator().validate(error);
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
