import { Booking, DeliveryMethod } from "@octocloud/types";
import { ScenarioConfigData } from "./ScenarioHelper";

interface BookingCheckData {
  newBooking: Booking;
  oldBooking: Booking;
  configData: ScenarioConfigData;
  rebooked?: boolean;
}

export class BookingScenarioHelper {
  public bookingCheck = (data: BookingCheckData): string[] => {
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
        : "DeliveryMethods are not matching provided ones",
      data.newBooking.voucher &&
      data.configData.deliveryMethods.includes(DeliveryMethod.VOUCHER)
        ? null
        : "Voucher is missing",
    ];

    if (!data.rebooked) {
      errors = [
        ...errors,
        data.newBooking.productId === data.oldBooking.productId
          ? null
          : "ProductId is not matching request",
        data.newBooking.optionId === data.oldBooking.optionId
          ? null
          : "OptionId is not matching request",
        data.newBooking.availabilityId === data.oldBooking.availabilityId
          ? null
          : "AvailabilityId is not matching request",
      ];
    }

    if (data.configData.deliveryMethods.includes(DeliveryMethod.TICKET)) {
      const ticketCheck =
        data.newBooking.unitItems.map((unitItem) => unitItem.ticket).length ===
        data.newBooking.unitItems.length;
      errors = [...errors, ticketCheck ? null : "Some/all tickets are missing"];
    }

    return errors.filter(Boolean);
  };
}
