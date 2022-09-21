import {
  Booking,
  Ticket,
  Contact,
  BookingAvailability,
  BookingStatus,
  Cancellation,
  CapabilityId,
  DeliveryMethod,
  BookingUnitItemSchema,
} from "@octocloud/types";
import { Capable, CapableToPOJOType } from "./../interfaces/Capable";
import { BookingPickupModel } from "./BookingPickup";
import { BookingPricingModel } from "./BookingPricing";
import { BookingContentModel } from "./BookingContent";
import { OptionModel } from "./Option";
import { ProductModel } from "./Product";
import { UnitItemModel } from "./UnitItemModel";

export class BookingModel implements Capable {
  public id: string;
  public uuid: string;
  public testMode: boolean;
  public resellerReference: Nullable<string>;
  public supplierReference: Nullable<string>;
  public status: BookingStatus;
  public utcCreatedAt: string;
  public utcUpdatedAt: Nullable<string>;
  public utcExpiresAt: Nullable<string>;
  public utcRedeemedAt: Nullable<string>;
  public utcConfirmedAt: Nullable<string>;
  public productId: string;
  public product: ProductModel;
  public optionId: string;
  public option: OptionModel;
  public cancellable: boolean;
  public cancellation: Nullable<Cancellation>;
  public freesale: boolean;
  public availabilityId: string;
  public availability: BookingAvailability;
  public contact: Contact;
  public notes: Nullable<string>;
  public deliveryMethods: DeliveryMethod[];
  public voucher: Nullable<Ticket>;
  public unitItemModels: UnitItemModel[];
  public bookingContentModel?: BookingContentModel;
  public bookingPricingModel?: BookingPricingModel;
  public bookingPickupModel?: BookingPickupModel;

  constructor({
    id,
    uuid,
    resellerReference,
    supplierReference,
    status,
    utcCreatedAt,
    utcUpdatedAt,
    utcExpiresAt,
    utcRedeemedAt,
    utcConfirmedAt,
    product,
    option,
    availability,
    contact,
    unitItemModels,
    notes,
    voucher,
    cancellation,
    cancellable,
  }: {
    id: string;
    uuid: string;
    resellerReference: Nullable<string>;
    supplierReference: Nullable<string>;
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
    unitItemModels: UnitItemModel[];
    notes: Nullable<string>;
    voucher: Nullable<Ticket>;
    cancellation?: Cancellation;
    cancellable?: boolean;
  }) {
    this.id = id;
    this.uuid = uuid;
    this.testMode = true;
    this.resellerReference = resellerReference ?? null;
    this.supplierReference = supplierReference ?? null;
    this.status = status;
    this.utcCreatedAt = utcCreatedAt;
    this.utcUpdatedAt = utcUpdatedAt;
    this.utcExpiresAt = utcExpiresAt;
    this.utcRedeemedAt = utcRedeemedAt;
    this.utcConfirmedAt = utcConfirmedAt;
    this.productId = product.id;
    this.product = product;
    this.optionId = option.id;
    this.option = option;
    this.cancellable = cancellable ?? true;
    this.cancellation = cancellation ?? null;
    this.freesale = product.allowFreesale;
    this.availabilityId = availability.id;
    this.availability = availability;
    this.contact = contact;
    this.notes = notes;
    this.deliveryMethods = product.deliveryMethods;
    this.voucher = voucher;
    this.unitItemModels = unitItemModels;
    this.bookingContentModel = new BookingContentModel();
    this.bookingPricingModel = new BookingPricingModel(
      this.product,
      this.option,
      this.unitItemModels
    );
    this.bookingPickupModel = new BookingPickupModel();
  }

  public getUnitItems = (): BookingUnitItemSchema[] => {
    return this.unitItemModels.map((model) => ({
      unitId: model.unitModel.id,
      resellerReference: model.resellerReference,
      uuid: model.uuid,
      contact: model.contact,
    }));
  };

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): Booking => {
    const {
      id,
      uuid,
      testMode,
      resellerReference,
      supplierReference,
      status,
      utcCreatedAt,
      utcUpdatedAt,
      utcExpiresAt,
      utcRedeemedAt,
      utcConfirmedAt,
      productId,
      product,
      optionId,
      option,
      cancellable,
      cancellation,
      freesale,
      availabilityId,
      availability,
      contact,
      notes,
      deliveryMethods,
      voucher,
      unitItemModels,
    } = this;
    const pojo: Booking = {
      id,
      uuid,
      testMode,
      resellerReference,
      supplierReference,
      status,
      utcCreatedAt,
      utcUpdatedAt,
      utcExpiresAt,
      utcRedeemedAt,
      utcConfirmedAt,
      productId,
      product: product.toPOJO({ useCapabilities, capabilities }),
      optionId,
      option: option.toPOJO({ useCapabilities, capabilities }),
      cancellable,
      cancellation,
      freesale,
      availabilityId,
      availability,
      contact,
      notes,
      deliveryMethods,
      voucher,
      unitItems: unitItemModels.map((model) =>
        model.toPOJO({ useCapabilities, capabilities })
      ),
    };

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Content))
    ) {
      Object.keys(this.bookingContentModel).forEach((key) => {
        pojo[key] = this.bookingContentModel[key];
      });
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      pojo.pricing = this.bookingPricingModel.getPricing();
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pickups))
    ) {
      Object.keys(this.bookingPickupModel).forEach((key) => {
        pojo[key] = this.bookingPickupModel[key];
      });
    }

    return pojo;
  };

  public static fromPOJO = (booking: Booking): BookingModel => {
    return new BookingModel({
      id: booking.id,
      uuid: booking.uuid,
      resellerReference: booking.resellerReference,
      supplierReference: booking.supplierReference,
      status: booking.status,
      product: ProductModel.fromPOJO(booking.product).setOnBooking(),
      option: OptionModel.fromPOJO(booking.option).setOnBooking(),
      availability: booking.availability,
      contact: booking.contact,
      unitItemModels: booking.unitItems.map((unitItem) =>
        UnitItemModel.fromPOJO(unitItem)
      ),
      notes: booking.notes,
      voucher: booking.voucher,
      utcCreatedAt: booking.utcCreatedAt,
      utcUpdatedAt: booking.utcUpdatedAt,
      utcExpiresAt: booking.utcExpiresAt,
      utcRedeemedAt: booking.utcRedeemedAt,
      utcConfirmedAt: booking.utcConfirmedAt,
      cancellation: booking.cancellation,
      cancellable: booking.cancellable,
    });
  };
}
