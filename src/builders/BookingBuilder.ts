import {
  BookingStatus,
  BookingAvailability,
  Contact,
  UnitItem,
} from "./../types/Booking";
import { OptionModel } from "./../models/Option";
import { ProductModel } from "./../models/Product";
import { CapabilityId } from "../types/Capability";
import { BookingModel } from "../models/Booking";

interface BookingBuilderData {
  id: string;
  uuid: string;
  resellerReference: string;
  supplierReference: string;
  status: BookingStatus;
  utcCreatedAt: string;
  utcUpdatedAt: Nullable<string>;
  utcExpiresAt: Nullable<string>;
  utcRedeemedAt: Nullable<string>;
  utcConfirmedAt: Nullable<string>;
  product: ProductModel;
  option: OptionModel;
  availability: BookingAvailability;
  contact: Contact;
  unitItems: UnitItem[];
  capabilities: CapabilityId[];
}

export class BookingBuilder {
  private booking: BookingModel;

  build(data: BookingBuilderData): BookingModel {
    const {
      id,
      uuid,
      capabilities,
      resellerReference,
      supplierReference,
      status,
      product,
      option,
      availability,
      contact,
      unitItems,
    } = data;

    this.booking = new BookingModel({
      id,
      uuid,
      resellerReference,
      supplierReference,
      status,
      product,
      option,
      availability,
      contact,
      unitItems,
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.booking = this.booking.addContent();
    }

    if (capabilities.includes(CapabilityId.Pricing)) {
      this.booking = this.booking.addPricing();
    }

    if (capabilities.includes(CapabilityId.Pickups)) {
      this.booking = this.booking.addPickup();
    }

    return this.booking;
  }
}
