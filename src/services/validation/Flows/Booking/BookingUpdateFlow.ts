import { Scenario } from "./../../Scenarios/Scenario";
import { BookingUnitItemSchema, UnitType } from "@octocloud/types";
import { Flow, FlowResult } from "../Flow";
import { BookingUpdateDateScenario } from "../../Scenarios/Booking/Update/BookingUpdateDate";
import { BookingUpdateUnitItemsScenario } from "../../Scenarios/Booking/Update/BookingUpdateUnitItems";
import { BookingUpdateContactScenario } from "../../Scenarios/Booking/Update/BookingUpdateContact";
import { BookingUpdateProductScenario } from "../../Scenarios/Booking/Update/BookingUpdateProduct";
import { BaseFlow } from "../BaseFlow";

export class BookingUpdateFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Booking Update");
  }
  public validate = async (): Promise<FlowResult> => {
    const scenarios: Scenario<unknown>[] = [
      await this.validateBookingUpdateDate(),
      await this.validateBookingUpdateUnitItems(),
      await this.validateBookingUpdateContact(),
    ];

    // TODO: check if it's possible to perform this update
    if (this.config.getProduct() === null) {
      scenarios.push(await this.validateBookingUpdateProduct());
    }
    return this.validateScenarios(scenarios);
  };

  private validateBookingUpdateDate =
    async (): Promise<BookingUpdateDateScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const result = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
      const booking = result.data;
      return new BookingUpdateDateScenario({
        booking,
        availabilityId: "2022-11-14T00:00:00-04:00",
        capabilities: this.config.getCapabilityIDs(),
      });
    };

  private validateBookingUpdateUnitItems =
    async (): Promise<BookingUpdateUnitItemsScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const result = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
      const booking = result.data;

      return new BookingUpdateUnitItemsScenario({
        unitItems: [...unitItems, ...unitItems],
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private validateBookingUpdateContact =
    async (): Promise<BookingUpdateContactScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const result = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
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
      const product = this.config.getProduct();

      const product2 = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const unitItems2: BookingUnitItemSchema[] = [
        { unitId: unitAdult.id },
        { unitId: unitAdult.id },
      ];
      const result = await this.apiClient.bookingReservation({
        productId: product.id,
        optionId: option.id,
        availabilityId: "2022-10-14T00:00:00-04:00",
        unitItems,
      });
      const booking = result.data;

      return new BookingUpdateProductScenario({
        productId: product2.id,
        optionId: product2.options[0].id,
        unitItems: unitItems2,
        availabilityId: "2022-10-14T00:00:00-04:00",
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };
}
