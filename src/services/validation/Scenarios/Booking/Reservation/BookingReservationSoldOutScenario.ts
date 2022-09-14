import { BookingUnitItemSchema, Product } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { UnprocessableEntityErrorValidator } from "../../../../../validators/backendValidator/Error/UnprocessableEntityErrorValidator";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationSoldOutScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private product: Product;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  constructor({
    product,
    optionId,
    availabilityId,
    unitItems,
  }: {
    product: Product;
    optionId: string;
    availabilityId: string;
    unitItems: BookingUnitItemSchema[];
  }) {
    this.product = product;
    this.optionId = optionId;
    this.availabilityId = availabilityId;
    this.unitItems = unitItems;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.product.id,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
    });

    const name = "Booking Reservation SOLD_OUT (400 UNPROCESSABLE_ENTITY)";
    const error = "Response should be UNPROCESSABLE_ENTITY";

    return this.bookingReservationScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new UnprocessableEntityErrorValidator()
    );
  };
}
