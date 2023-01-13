import { DeliveryFormat, DeliveryMethod, DeliveryOption, Ticket } from "@octocloud/types";
import { BookingModel, ProductModel } from "@octocloud/generators";
import assert from "assert";

export abstract class TicketFactory {
  public static createFromProductForBooking(productModel: ProductModel): Nullable<Ticket> {
    if (productModel.deliveryMethods.includes(DeliveryMethod.VOUCHER)) {
      return null;
    }

    return {
      redemptionMethod: productModel.redemptionMethod,
      utcRedeemedAt: null,
      deliveryOptions: [],
    };
  }

  public static createFromBookingForBooking(bookingModel: BookingModel): Nullable<Ticket> {
    if (bookingModel.deliveryMethods.includes(DeliveryMethod.VOUCHER) === false) {
      return null;
    }

    const deliveryOptions: DeliveryOption[] = [];
    if (bookingModel.productModel.deliveryFormats.includes(DeliveryFormat.PDF_URL)) {
      deliveryOptions.push({
        deliveryFormat: DeliveryFormat.PDF_URL,
        deliveryValue: `https://api.octomock.com/octo/pdf?booking=${bookingModel.uuid}`,
      });
    }
    if (bookingModel.productModel.deliveryFormats.includes(DeliveryFormat.QRCODE)) {
      assert(bookingModel.supplierReference !== null);

      deliveryOptions.push({
        deliveryFormat: DeliveryFormat.QRCODE,
        deliveryValue: bookingModel.supplierReference,
      });
    }

    return {
      redemptionMethod: bookingModel.productModel.redemptionMethod,
      utcRedeemedAt: null,
      deliveryOptions: deliveryOptions,
    };
  }
}
