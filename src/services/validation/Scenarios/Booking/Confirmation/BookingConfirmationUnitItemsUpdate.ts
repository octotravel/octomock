import { Booking, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingConfirmationScenarioHelper } from "../../../helpers/BookingConfirmationScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingConfirmationUnitItemUpdateScenario
  implements Scenario<Booking>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private capabilities: CapabilityId[];
  private unitItems: BookingUnitItemSchema[];
  private booking: Booking;
  constructor({
    capabilities,
    unitItems,
    booking,
  }: {
    capabilities: CapabilityId[];
    unitItems: BookingUnitItemSchema[];
    booking: Booking;
  }) {
    this.capabilities = capabilities;
    this.unitItems = unitItems;
    this.booking = booking;
  }
  private bookingConfirmationScenarioHelper =
    new BookingConfirmationScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingConfirmation({
      uuid: this.booking.uuid,
      contact: {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "johndoe@mail.com",
        fullName: "John Doe",
        notes: "Test note",
      },
      resellerReference: "RESELLERREF#1",
      unitItems: this.unitItems,
    });
    const name = `Booking Confirmation unitItems update`;
    const description = descriptions.bookingConfirmationUnitItemsUpdate;

    return this.bookingConfirmationScenarioHelper.validateBookingConfirmation(
      {
        result,
        name,
        description,
      },
      {
        capabilities: this.capabilities,
      },
      this.booking
    );
  };
}
