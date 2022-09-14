import { BookingReservationScenario } from "../../Scenarios/Booking/Reservation/BookingReservationScenario";
import { Flow, FlowResult } from "../Flow";
import { BookingReservationInvalidProductScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidProductScenario";
import { BookingReservationInvalidOptionScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidOptionScenario";
import { BookingReservationInvalidAvailabilityIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidAvailabilityIdScenario";
import { BaseFlow } from "../BaseFlow";
import { BookingUnitItemSchema, Product, UnitType } from "@octocloud/types";
import { BookingReservationSoldOutScenario } from "../../Scenarios/Booking/Reservation/BookingReservationSoldOutScenario";
import { BookingReservationMissingUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationMissingUnitItemsScenario";
import { BookingReservationEmptyUnitItemsScenario } from "../../Scenarios/Booking/Reservation/BookingReservationEmptyUnitItemsScenario";
import { BookingReservationInvalidUnitIdScenario } from "../../Scenarios/Booking/Reservation/BookingReservationInvalidUnitIdScenario";

export class BookingReservationFlow extends BaseFlow implements Flow {
  constructor() {
    super("Booking Reservation");
  }

  public validate = async (): Promise<FlowResult> => {
    const scenarios = [
      await this.reserveAvailableProduct(),
      await this.reserveSoldOutProduct(),
      await this.reserveInvalidProduct(),
      await this.reserveInvalidOption(),
      await this.reserveInvalidAvailabilityID(),
      await this.reserveWithMissingUnitItems(),
      await this.reserveWithEmptyUnitItems(),
      await this.validateBookingInvalidUnitId(),
    ];
    return this.validateScenarios(scenarios);
  };

  private reserveAvailableProduct =
    async (): Promise<BookingReservationScenario> => {
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

      const bookingData = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-14T00:00:00-04:00",
        unitItems,
        notes: "Test note",
      };
      return new BookingReservationScenario(bookingData);
    };

  private reserveSoldOutProduct =
    async (): Promise<BookingReservationSoldOutScenario> => {
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

      const bookingData = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-15T00:00:00-04:00",
        unitItems,
      };
      return new BookingReservationSoldOutScenario(bookingData);
    };

  private reserveInvalidProduct =
    async (): Promise<BookingReservationInvalidProductScenario> => {
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
      return new BookingReservationInvalidProductScenario({
        product: { id: "invalid_product_id" } as Product,
        optionId: option.id,
        availabilityId: "2022-09-14T00:00:00-04:00",
        unitItems,
      });
    };

  private reserveInvalidOption =
    async (): Promise<BookingReservationInvalidOptionScenario> => {
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
      return new BookingReservationInvalidOptionScenario({
        product: product,
        optionId: "invalid_optionId",
        availabilityId: "2022-09-14T00:00:00-04:00",
        unitItems,
      });
    };

  private reserveInvalidAvailabilityID =
    async (): Promise<BookingReservationInvalidAvailabilityIdScenario> => {
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

      const bookingData = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-15T00:00:00-04:00",
        unitItems,
      };
      return new BookingReservationInvalidAvailabilityIdScenario(bookingData);
    };

  private reserveWithMissingUnitItems =
    async (): Promise<BookingReservationMissingUnitItemsScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitAdult =
        option.units.find((u) => u.type === UnitType.ADULT) ?? null;
      if (unitAdult === null) {
        throw Error("no adult unit");
      }

      const bookingData = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-15T00:00:00-04:00",
      };
      return new BookingReservationMissingUnitItemsScenario(bookingData);
    };

  private reserveWithEmptyUnitItems =
    async (): Promise<BookingReservationEmptyUnitItemsScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const bookingData = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-15T00:00:00-04:00",
        unitItems: [],
      };
      return new BookingReservationEmptyUnitItemsScenario(bookingData);
    };

  private validateBookingInvalidUnitId =
    async (): Promise<BookingReservationInvalidUnitIdScenario> => {
      const product = this.config.getProduct();
      // TODO: get from somewhere else
      const option = product.options[0];

      const unitItems: BookingUnitItemSchema[] = [
        { unitId: "invalid_unit_id" },
      ];

      const data = {
        product: product,
        optionId: option.id,
        availabilityId: "2022-09-15T00:00:00-04:00",
        unitItems,
      };

      return new BookingReservationInvalidUnitIdScenario(data);
    };
}
