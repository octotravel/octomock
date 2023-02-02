import { BookingContactSchema, Contact } from "@octocloud/types";
import { BookingModel, OrderModel } from "@octocloud/generators";

export abstract class ContactFactory {
  public static createForBooking({
    bookingModel,
    bookingContactScheme,
  }: {
    bookingModel: Nullable<BookingModel>;
    bookingContactScheme?: BookingContactSchema;
  }): Contact {
    const bookingModelContact = bookingModel?.contact;

    return {
      fullName:
        bookingContactScheme?.fullName ?? bookingModelContact?.fullName ?? null,
      firstName:
        bookingContactScheme?.firstName ??
        bookingModelContact?.firstName ??
        null,
      lastName:
        bookingContactScheme?.lastName ?? bookingModelContact?.lastName ?? null,
      emailAddress:
        bookingContactScheme?.emailAddress ??
        bookingModelContact?.emailAddress ??
        null,
      phoneNumber:
        bookingContactScheme?.phoneNumber ??
        bookingModelContact?.phoneNumber ??
        null,
      locales:
        bookingContactScheme?.locales ?? bookingModelContact?.locales ?? [],
      country:
        bookingContactScheme?.country ?? bookingModelContact?.country ?? null,
      notes: bookingContactScheme?.notes ?? bookingModelContact?.notes ?? null,
      postalCode:
        bookingContactScheme?.postalCode ??
        bookingModelContact?.postalCode ??
        null,
    };
  }

  public static createForOrder({
    orderModel,
    orderContactScheme,
  }: {
    orderModel: OrderModel;
    orderContactScheme?: Contact;
  }): Contact {
    const orderModelContact = orderModel.contact;

    return {
      fullName:
        orderContactScheme?.fullName ?? orderModelContact?.fullName ?? null,
      firstName:
        orderContactScheme?.firstName ?? orderModelContact?.firstName ?? null,
      lastName:
        orderContactScheme?.lastName ?? orderModelContact?.lastName ?? null,
      emailAddress:
        orderContactScheme?.emailAddress ??
        orderModelContact?.emailAddress ??
        null,
      phoneNumber:
        orderContactScheme?.phoneNumber ??
        orderModelContact?.phoneNumber ??
        null,
      locales: orderContactScheme?.locales ?? orderModelContact?.locales ?? [],
      country:
        orderContactScheme?.country ?? orderModelContact?.country ?? null,
      notes: orderContactScheme?.notes ?? orderModelContact?.notes ?? null,
      postalCode:
        orderContactScheme?.postalCode ?? orderModelContact?.postalCode ?? null,
    };
  }
}
