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

    const errors = new Array<ValidatorError>();

    if (!deliveryMethodsMatch) {
      errors.push(
        new ValidatorError({
          message: "DeliveryMethods are not matching provided ones",
        })
      );
    }

    const voucherIsMissing = !(
      data.newBooking.voucher &&
      data.configData.deliveryMethods.includes(DeliveryMethod.VOUCHER)
    );
    if (voucherIsMissing) {
      errors.push(new ValidatorError({ message: "Voucher is missing" }));
    }

    if (!data.rebooked) {
      if (data.newBooking.productId !== data.oldBooking.productId) {
        errors.push(
          new ValidatorError({
            message: "ProductId is not matching request",
          })
        );
      }

      if (data.newBooking.optionId !== data.oldBooking.optionId) {
        errors.push(
          new ValidatorError({ message: "OptionId is not matching request" })
        );
      }
    }

    if (data.configData.deliveryMethods.includes(DeliveryMethod.TICKET)) {
      const ticketsMissing =
        data.newBooking.unitItems.map((unitItem) => unitItem.ticket).length !==
        data.newBooking.unitItems.length;

      if (ticketsMissing) {
        errors.push(
          new ValidatorError({ message: "Some/all tickets are missing" })
        );
      }
    }

    return errors;
  };
}
