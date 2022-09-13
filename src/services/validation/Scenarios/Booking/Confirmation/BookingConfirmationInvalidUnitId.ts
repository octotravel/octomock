import {
  BookingContactSchema,
  BookingUnitItemSchema,
  CapabilityId,
} from "@octocloud/types";
import { ApiClient } from "../../../api/ApiClient";
import { Scenario } from "../../Scenario";
import { InvalidUnitIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidUnitIdErrorValidator";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";

export class BookingConfirmationInvalidUnitIdScenario implements Scenario<any> {
  private apiClient: ApiClient;
  private uuid: string;
  private unitItems: BookingUnitItemSchema[];
  private contact: BookingContactSchema;
  constructor({
    apiClient,
    uuid,
    unitItems,
    contact,
  }: {
    apiClient: ApiClient;
    uuid: string;
    unitItems: BookingUnitItemSchema[];
    contact: BookingContactSchema;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.contact = contact;
    this.unitItems = unitItems;
    this.uuid = uuid;
  }
  private bookingConfirmationScenarioHelper =
    new BookingConfirmationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      unitItems: this.unitItems,
      contact: this.contact,
    });

    const name = "Booking Confirmation Invalid Unit ID (400 INVALID_UNIT_ID)";
    const error = "Response should be INVALID_UNIT_ID";

    return this.bookingConfirmationScenarioHelper.validateBookingConfirmationError(
      {
        result,
        name,
      },
      error,
      new InvalidUnitIdErrorValidator()
    );
  };
}
