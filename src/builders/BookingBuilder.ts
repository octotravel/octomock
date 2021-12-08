import { addMinutes } from "date-fns";
import { DataGenerator } from "./../generators/DataGenerator";
import { OctoUnitItem } from "./../schemas/Booking";
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
import { DateHelper } from "../helpers/DateHelper";
import { RedemptionMethod } from "../types/Product";

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
  unitItems: OctoUnitItem[];
  capabilities: CapabilityId[];
}

export class BookingBuilder {
  private booking: BookingModel;

  build(data: BookingBuilderData): BookingModel {
    const {
      id,
      uuid,
      resellerReference,
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
      supplierReference: DataGenerator.generateSupplierReference(),
      status,
      product,
      option,
      availability,
      contact,
      unitItems: unitItems.map((item) =>
        this.buildUnitItem(item, status, option)
      ),
      utcCreatedAt: DateHelper.bookingUTCFormat(new Date()),
      utcUpdatedAt: DateHelper.bookingUTCFormat(new Date()),
      utcExpiresAt: DateHelper.bookingUTCFormat(addMinutes(new Date(), 30)),
      utcRedeemedAt: null,
      utcConfirmedAt: null,
    });

    return this.booking;
  }

  private buildUnitItem = (
    item: OctoUnitItem,
    status: BookingStatus,
    option: OptionModel
  ): UnitItem => {
    const unitModel = option.findUnitModel(item.unitId);
    if (unitModel === null) {
      throw new Error("invalid unit id");
    }
    const unitItem: UnitItem = {
      uuid: item.uuid ?? DataGenerator.generateUUID(),
      supplierReferecne: DataGenerator.generateSupplierReference(),
      resellerReference: item.resellerReference ?? null,
      unitId: item.unitId,
      unit: unitModel.toPOJO(),
      status,
      utcRedeemedAt: null,
      contact: {
        fullName: null,
        firstName: null,
        lastName: null,
        emailAddress: null,
        phoneNumber: null,
        locales: [],
        country: null,
        notes: null,
      },
      ticket: {
        redemptionMethod: RedemptionMethod.DIGITAL,
        utcRedeemedAt: null,
        deliveryOptions: [],
      },
    };

    return unitItem;
  };
}
