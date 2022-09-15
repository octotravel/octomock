import { BookingConfirmationScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmation";
import { Flow, FlowResult } from "../Flow";
import { BookingConfirmationUnitItemUpdateScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationUnitItemsUpdate";
import { BookingConfirmationInvalidUUIDScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationInvalidUUID";
import { BookingConfirmationInvalidUnitIdScenario } from "../../Scenarios/Booking/Confirmation/BookingConfirmationInvalidUnitId";
import { BaseFlow } from "../BaseFlow";
import { BookingUnitItemSchema, UnitType } from "@octocloud/types";

export class BookingConfirmationFlow extends BaseFlow implements Flow {
  private apiClient = this.config.getApiClient();
  constructor() {
    super("Booking Confirmation");
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

  private validateBookingConfirmation =
    async (): Promise<BookingConfirmationScenario> => {
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
      return new BookingConfirmationScenario({
        capabilities: this.config.getCapabilityIDs(),
        booking,
      });
    };

  private validateBookingConfirmationUnitItemsUpdate =
    async (): Promise<BookingConfirmationUnitItemUpdateScenario> => {
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
      // todo: update units and check max units
      return new BookingConfirmationUnitItemUpdateScenario({
        booking: booking,
        capabilities: this.config.getCapabilityIDs(),
        unitItems: [...unitItems, ...unitItems],
      });
    };

  private validateBookingInvalidUUIDError =
    async (): Promise<BookingConfirmationInvalidUUIDScenario> => {
      return new BookingConfirmationInvalidUUIDScenario({
        uuid: "invalid_UUID",
      });
    };

  private validateBookingInvalidUnitId =
    async (): Promise<BookingConfirmationInvalidUnitIdScenario> => {
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
      return new BookingConfirmationInvalidUnitIdScenario({
        uuid: booking.uuid,
        unitItems: [
          {
            unitId: "invalid_unitId",
          },
          {
            unitId: "invalid_unitId",
          },
        ],
        contact: {},
      });
    };
}
