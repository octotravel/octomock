import { BookingConfirmationScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmation";
import { Flow, FlowResult } from "../Flow";
import { BookingConfirmationUnitItemUpdateScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationUnitItemsUpdate";
import { BookingConfirmationInvalidUUIDScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationInvalidUUID";
import { BookingConfirmationInvalidUnitIdScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationInvalidUnitId";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";
import docs from "../../consts/docs";

export class BookingConfirmationFlow extends BaseFlow implements Flow {
  private booker = new Booker();
  constructor() {
    super("Booking Confirmation", docs.bookingConfirmation);
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.validateBookingConfirmation(),
      await this.validateBookingConfirmationUnitItemsUpdate(),
      await this.validateBookingInvalidUUIDError(),
      await this.validateBookingInvalidUnitId(),
    ];

    return this.validateScenarios(scenarios);
  };

  private validateBookingConfirmation = async (): Promise<BookingConfirmationScenario> => {
    const [bookableProduct] = this.config.productConfig.availableProducts;

    const result = await this.booker.createReservation(bookableProduct);
    return new BookingConfirmationScenario({
      capabilities: this.config.getCapabilityIDs(),
      booking: result.data,
    });
  };

  private validateBookingConfirmationUnitItemsUpdate =
    async (): Promise<BookingConfirmationUnitItemUpdateScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct, {
        unitItemsQuantity: 2,
      });
      const unitItems = bookableProduct.getValidUnitItems({ quantity: 3 });

      return new BookingConfirmationUnitItemUpdateScenario({
        booking: result.data,
        capabilities: this.config.getCapabilityIDs(),
        unitItems,
      });
    };

  private validateBookingInvalidUUIDError =
    async (): Promise<BookingConfirmationInvalidUUIDScenario> => {
      return new BookingConfirmationInvalidUUIDScenario({
        uuid: this.config.invalidUUID,
      });
    };

  private validateBookingInvalidUnitId =
    async (): Promise<BookingConfirmationInvalidUnitIdScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct, {
        unitItemsQuantity: 2,
      });
      const unitItems = bookableProduct.getInvalidUnitItems({ quantity: 1 });

      return new BookingConfirmationInvalidUnitIdScenario({
        uuid: result.data.uuid,
        unitItems,
        contact: {},
      });
    };
}
