import { Booking, DeliveryMethod } from "@octocloud/types";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { ScenarioConfigData } from "./ScenarioHelper";

interface BookingCheckData {
  newBooking: Booking;
  oldBooking: Booking;
  configData: ScenarioConfigData;
  rebooked?: boolean;
}

export class BookingScenarioHelper {
  public bookingCheck = (data: BookingCheckData): ValidatorError[] => {
    const deliveryMethodsMatch =
      data.configData.deliveryMethods.length ===
      data.newBooking.deliveryMethods.length
        ? data.configData.deliveryMethods
            .map((method) => {
              return data.newBooking.deliveryMethods.includes(method);
            })
            .every((status) => status)
        : false;

    let errors = [
      deliveryMethodsMatch
        ? null
        : new ValidatorError({
            message: "DeliveryMethods are not matching provided ones",
          }),
      data.newBooking.voucher &&
      data.configData.deliveryMethods.includes(DeliveryMethod.VOUCHER)
        ? null
        : new ValidatorError({ message: "Voucher is missing" }),
    ];

    if (!data.rebooked) {
      errors = [
        ...errors,
        data.newBooking.productId === data.oldBooking.productId
          ? null
          : new ValidatorError({
              message: "ProductId is not matching request",
            }),
        data.newBooking.optionId === data.oldBooking.optionId
          ? null
          : new ValidatorError({ message: "OptionId is not matching request" }),
      ];
    }

    if (data.configData.deliveryMethods.includes(DeliveryMethod.TICKET)) {
      const ticketCheck =
        data.newBooking.unitItems.map((unitItem) => unitItem.ticket).length ===
        data.newBooking.unitItems.length;
      errors = [
        ...errors,
        ticketCheck
          ? null
          : new ValidatorError({ message: "Some/all tickets are missing" }),
      ];
    }

    return errors.filter(Boolean);
  };
}
