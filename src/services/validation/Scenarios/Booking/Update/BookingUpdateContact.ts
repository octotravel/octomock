import { Booking, BookingContactSchema, CapabilityId } from "@octocloud/types";
import { Scenario } from "../../Scenario";
import { BookingUpdateScenarioHelper } from "../../../helpers/BookingUpdateScenarioHelper";
import { Config } from "../../../config/Config";
import descriptions from "../../../consts/descriptions";

export class BookingUpdateContactScenario implements Scenario<Booking> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private capabilities: CapabilityId[];
  private booking: Booking;
  private contact: BookingContactSchema;
  private notes: string;
  constructor({
    capabilities,
    booking,
    contact,
    notes,
  }: {
    capabilities: CapabilityId[];
    booking: Booking;
    contact: BookingContactSchema;
    notes: string;
  }) {
    this.capabilities = capabilities;
    this.booking = booking;
    this.contact = contact;
    this.notes = notes;
  }
  private bookingUpdateScenarioHelper = new BookingUpdateScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.bookingUpdate({
      uuid: this.booking.uuid,
      contact: this.contact,
      notes: this.notes,
    });
    const name = `Booking Update - Contact`;
    const description = descriptions.bookingUpdateContact;

    return this.bookingUpdateScenarioHelper.validateBookingUpdate(
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
