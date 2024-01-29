import { BookingContactSchema, Contact } from '@octocloud/types';
import { BookingModel } from '@octocloud/generators';

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
      fullName: bookingContactScheme?.fullName ?? bookingModelContact?.fullName ?? null,
      firstName: bookingContactScheme?.firstName ?? bookingModelContact?.firstName ?? null,
      lastName: bookingContactScheme?.lastName ?? bookingModelContact?.lastName ?? null,
      emailAddress: bookingContactScheme?.emailAddress ?? bookingModelContact?.emailAddress ?? null,
      phoneNumber: bookingContactScheme?.phoneNumber ?? bookingModelContact?.phoneNumber ?? null,
      locales: bookingContactScheme?.locales ?? bookingModelContact?.locales ?? [],
      country: bookingContactScheme?.country ?? bookingModelContact?.country ?? null,
      notes: bookingContactScheme?.notes ?? bookingModelContact?.notes ?? null,
      postalCode: bookingContactScheme?.postalCode ?? bookingModelContact?.postalCode ?? null,
    };
  }

  public static createForOrder({
    contact,
    orderContactScheme,
  }: {
    contact?: Contact;
    orderContactScheme?: Contact;
  }): Contact {
    return {
      fullName: orderContactScheme?.fullName ?? contact?.fullName ?? null,
      firstName: orderContactScheme?.firstName ?? contact?.firstName ?? null,
      lastName: orderContactScheme?.lastName ?? contact?.lastName ?? null,
      emailAddress: orderContactScheme?.emailAddress ?? contact?.emailAddress ?? null,
      phoneNumber: orderContactScheme?.phoneNumber ?? contact?.phoneNumber ?? null,
      locales: orderContactScheme?.locales ?? contact?.locales ?? [],
      country: orderContactScheme?.country ?? contact?.country ?? null,
      notes: orderContactScheme?.notes ?? contact?.notes ?? null,
      postalCode: orderContactScheme?.postalCode ?? contact?.postalCode ?? null,
    };
  }
}
