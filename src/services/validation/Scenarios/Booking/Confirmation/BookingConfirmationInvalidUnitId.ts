import { BookingContactSchema, BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { InvalidUnitIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidUnitIdErrorValidator";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingConfirmationInvalidUnitIdScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private uuid: string;
  private unitItems: BookingUnitItemSchema[];
  private contact: BookingContactSchema;
  constructor({
    uuid,
    unitItems,
    contact,
  }: {
    uuid: string;
    unitItems: BookingUnitItemSchema[];
    contact: BookingContactSchema;
  }) {
    this.contact = contact;
    this.unitItems = unitItems;
    this.uuid = uuid;
  }
  private bookingConfirmationScenarioHelper = new BookingConfirmationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.uuid,
      unitItems: this.unitItems,
      contact: this.contact,
    });

    const name = "Booking Confirmation Invalid Unit ID (400 INVALID_UNIT_ID)";
    const error = "Response should be INVALID_UNIT_ID";
    const description = descriptions.invalidUnitId;

    return this.bookingConfirmationScenarioHelper.validateError(
      {
        result,
        name,
        description,
      },
      error,
      new InvalidUnitIdErrorValidator()
    );
  };
}
