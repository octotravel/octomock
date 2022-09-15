import { Booking, BookingUnitItemSchema } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingReservationScenarioHelper } from "../../../helpers/BookingReservationScenarioHelper";
import { Config } from "../../../config/Config";

export class BookingReservationScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productId: string;
  private optionId: string;
  private availabilityId: string;
  private unitItems: BookingUnitItemSchema[];
  private notes: string;
  constructor({
    productId,
    optionId,
    availabilityId,
    unitItems,
    notes,
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
    this.notes = notes;
  }
  private bookingReservationScenarioHelper =
    new BookingReservationScenarioHelper();
  public validate = async () => {
    const result = await this.apiClient.bookingReservation({
      productId: this.productId,
      optionId: this.optionId,
      availabilityId: this.availabilityId,
      unitItems: this.unitItems,
      notes: this.notes,
    });
    const name = `Booking Reservation`;

    return this.bookingReservationScenarioHelper.validateBookingReservation(
      {
        result,
        name,
      },
      {
        capabilities: this.config.getCapabilityIDs(),
      }
    );
  };
}
