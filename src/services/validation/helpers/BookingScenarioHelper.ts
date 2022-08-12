import { Booking, DeliveryMethod } from "@octocloud/types";
import { ScenarioConfigData, ScenarioHelperData } from "./ScenarioHelper";

export class BookingScenarioHelper {
  public bookingCheck = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData
  ): string[] => {
    const booking = data.response.data.body;
    const deliveryMethodsMatch =
      configData.deliveryMethods.length === booking.deliveryMethods.length
        ? configData.deliveryMethods
            .map((method) => {
              return booking.deliveryMethods.includes(method);
            })
            .every((status) => status)
        : false;
    const ticketCheck = configData.deliveryMethods.includes(
      DeliveryMethod.TICKET
    )
      ? booking.unitItems.map((unitItem) => unitItem.ticket).length ===
        data.request.body.unitItems.length
      : true;
    const unitIdCheck =
      booking.unitItems.length === data.request.body.unitItems.length
        ? booking.unitItems
            .map((unitItem) => {
              return data.request.body.unitItems
                .map((item) => item.unitId)
                .includes(unitItem.unitId);
            })
            .every((status) => status)
        : false;
    return [
      booking.productId === data.request.body.productId
        ? null
        : "ProductId is not matching request",
      booking.optionId === data.request.body.optionId
        ? null
        : "OptionId is not matching request",
      booking.availabilityId === data.request.body.availabilityId
        ? null
        : "AvailabilityId is not matching request",
      deliveryMethodsMatch
        ? null
        : "DeliveryMethods are not matching provided ones",
      booking.voucher &&
      configData.deliveryMethods.includes(DeliveryMethod.VOUCHER)
        ? null
        : "Voucher is missing",
      booking.unitItems.length === data.request.body.unitItems.length
        ? null
        : "UnitItems count is not matching",
      ticketCheck ? null : "Some/all tickets are missing",
      unitIdCheck ? null : "UnitIds are not matching",
    ].filter(Boolean);
  };
}
