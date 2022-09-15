import { BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { InvalidUnitIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidUnitIdErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationInvalidUnitIdScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    productId,
    optionId,
    availabilityId,
    unitItems,
  }: {
    productId: string;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
  }) {
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });

    const name = "Booking Reservation Invalid Unit ID (400 INVALID_UNIT_ID)";
    const error = "Response should be INVALID_UNIT_ID";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new InvalidUnitIdErrorValidator()
    );
  };
}
