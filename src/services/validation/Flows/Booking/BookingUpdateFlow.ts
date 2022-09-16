import { Scenario } from "./../../Scenarios/Scenario";
import { Flow, FlowResult } from "../Flow";
import { BookingUpdateDateScenario } from "../../Scenarios/Booking/Update/BookingUpdateDate";
import { BookingUpdateUnitItemsScenario } from "../../Scenarios/Booking/Update/BookingUpdateUnitItems";
import { BookingUpdateContactScenario } from "../../Scenarios/Booking/Update/BookingUpdateContact";
import { BookingUpdateProductScenario } from "../../Scenarios/Booking/Update/BookingUpdateProduct";
import { BaseFlow } from "../BaseFlow";
import { Booker } from "../../Booker";

export class BookingUpdateFlow extends BaseFlow implements Flow {
  private booker = new Booker();
  constructor() {
    super("Booking Update");
  }
  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      await this.validateBookingUpdateDate(),
      await this.validateBookingUpdateUnitItems(),
      await this.validateBookingUpdateContact(),
      await this.validateBookingUpdateProduct(),
    ];

    return this.validateScenarios(scenarios);
  };

  private validateBookingUpdateDate =
    async (): Promise<BookingUpdateDateScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct);
      const booking = result.data;
      return new BookingUpdateDateScenario({
        booking,
        availabilityId: bookableProduct.getAvialabilityID({
          omitID: booking.availabilityId,
        }),
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateBookingUpdateUnitItems =
    async (): Promise<BookingUpdateUnitItemsScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct, {
        unitItemsQuantity: 2,
      });
      const booking = result.data;
      const unitItems = bookableProduct.getValidUnitItems({ quantity: 3 });

      return new BookingUpdateUnitItemsScenario({
        unitItems,
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private validateBookingUpdateContact =
    async (): Promise<BookingUpdateContactScenario> => {
      const [bookableProduct] = this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct);
      const booking = result.data;
      return new BookingUpdateContactScenario({
        contact: {
          fullName: "John Doe",
          firstName: "John",
          lastName: "Doe",
          emailAddress: "johndoe@email.com",
          phoneNumber: "+00000000",
          country: "GB",
          notes: "Test notes contact",
          locales: ["en"],
        },
        notes: "Test note",
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private validateBookingUpdateProduct =
    async (): Promise<BookingUpdateProductScenario> => {
      const [bookableProduct1, bookableProduct2] =
        this.config.productConfig.availableProducts;

      const result = await this.booker.createReservation(bookableProduct1);
      const booking = result.data;

      // TODO: add rebook to Booker
      return new BookingUpdateProductScenario({
        productId: bookableProduct2.product.id,
        optionId: bookableProduct2.getOption().id,
        unitItems: bookableProduct2.getValidUnitItems(),
        availabilityId: bookableProduct2.randomAvailabilityID,
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };
}
