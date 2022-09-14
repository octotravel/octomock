import { Booking } from "@octocloud/types";
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
    const errors = new Array<ValidatorError>();
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

    return errors;
  };
}
