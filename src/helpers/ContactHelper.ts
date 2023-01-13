import { BookingContactSchema } from "@octocloud/types";
import { Contact } from "@octocloud/types";

export abstract class ContactMapper {
  public static remapContactToBookingContactSchema(contact: Contact): BookingContactSchema {
    return {
      fullName: contact.fullName ?? undefined,
      firstName: contact.firstName ?? undefined,
      lastName: contact.lastName ?? undefined,
      emailAddress: contact.emailAddress ?? undefined,
      phoneNumber: contact.phoneNumber ?? undefined,
      country: contact.country ?? undefined,
      notes: contact.notes ?? undefined,
      locales: contact.locales ?? undefined,
      postalCode: contact.postalCode ?? undefined,
    };
  }
}
