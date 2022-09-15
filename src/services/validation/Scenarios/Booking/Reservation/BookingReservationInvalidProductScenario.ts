import { BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { InvalidProductIdErrorValidator } from "../../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationInvalidProductScenario implements Scenario<any> {
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
    notes?: string;
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

    const name = "Booking Reservation Invalid Product (400 INVALID_PRODUCT_ID)";
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
