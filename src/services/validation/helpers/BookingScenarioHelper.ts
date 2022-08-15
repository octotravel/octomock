import { Booking, DeliveryMethod } from "@octocloud/types";
import { ScenarioConfigData } from "./ScenarioHelper";

export class BookingScenarioHelper {
  public bookingCheck = (
    newBooking: Booking,
    oldBooking: Booking,
    configData: ScenarioConfigData
  ): string[] => {
    const deliveryMethodsMatch =
      configData.deliveryMethods.length === newBooking.deliveryMethods.length
        ? configData.deliveryMethods
            .map((method) => {
              return newBooking.deliveryMethods.includes(method);
            })
            .every((status) => status)
        : false;
    const ticketCheck = configData.deliveryMethods.includes(
      DeliveryMethod.TICKET
    )
      ? newBooking.unitItems.map((unitItem) => unitItem.ticket).length ===
        oldBooking.unitItems.length
      : true;
    const unitIdCheck =
      newBooking.unitItems.length === oldBooking.unitItems.length
        ? newBooking.unitItems
            .map((unitItem) => {
              return oldBooking.unitItems
                .map((item) => item.unitId)
                .includes(unitItem.unitId);
            })
            .every((status) => status)
        : false;
    return [
      newBooking.productId === oldBooking.productId
        ? null
        : "ProductId is not matching request",
      newBooking.optionId === oldBooking.optionId
        ? null
        : "OptionId is not matching request",
      newBooking.availabilityId === oldBooking.availabilityId
        ? null
        : "AvailabilityId is not matching request",
      deliveryMethodsMatch
        ? null
        : "DeliveryMethods are not matching provided ones",
      newBooking.voucher &&
      configData.deliveryMethods.includes(DeliveryMethod.VOUCHER)
        ? null
        : "Voucher is missing",
      newBooking.unitItems.length === oldBooking.unitItems.length
        ? null
        : "UnitItems count is not matching",
      ticketCheck ? null : "Some/all tickets are missing",
      unitIdCheck ? null : "UnitIds are not matching",
    ].filter(Boolean);
  };
}
