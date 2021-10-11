import { BookingPickupModel } from "./BookingPickup";
import { BookingPricingModel } from "./BookingPricing";
import { BookingContentModel } from "./BookingContent";
import { OptionModel } from "./Option";
import { ProductModel } from "./Product";
import {
  Booking,
  UnitItem,
  Voucher,
  Contact,
  BookingAvailability,
  BookingStatus,
} from "./../types/Booking";
import { CapabilityId } from "../types/Capability";
import { DeliveryMethod } from "../types/Product";

export class BookingModel {
  private id: string;
  private uuid: string;
  private testMode: boolean;
  private resellerReference: string;
  private supplierReference: string;
  private status: BookingStatus;
  private utcCreatedAt: string;
  private utcUpdatedAt: Nullable<string>;
  private utcExpiresAt: Nullable<string>;
  private utcRedeemedAt: Nullable<string>;
  private utcConfirmedAt: Nullable<string>;
  private productId: string;
  private product: ProductModel;
  private optionId: string;
  private option: OptionModel;
  private cancellable: boolean;
  private cancellation: Nullable<unknown>; // TODO: get the object type
  private freesale: boolean;
  private availabilityId: string;
  private availability: BookingAvailability;
  private contact: Contact;
  private notes: Nullable<string>;
  private deliveryMethods: DeliveryMethod[];
  private voucher: Voucher;
  private unitItems: UnitItem[];
  private bookingContentModel?: BookingContentModel;
  private bookingPricingModel?: BookingPricingModel;
  private bookingPickupModel?: BookingPickupModel;

  private capabilities: CapabilityId[];

  constructor({
    id,
    uuid,
    resellerReference,
    supplierReference,
    status,
    // utcCreatedAt,
    // utcUpdatedAt,
    // utcExpiresAt,
    // utcRedeemedAt,
    // utcConfirmedAt,
    product,
    option,
    availability,
    contact,
    unitItems,
  }: {
    id: string;
    uuid: string;
    resellerReference: string;
    supplierReference: string;
    status: BookingStatus;
    // utcCreatedAt: string;
    // utcUpdatedAt: Nullable<string>;
    // utcExpiresAt: Nullable<string>;
    // utcRedeemedAt: Nullable<string>;
    // utcConfirmedAt: Nullable<string>;
    product: ProductModel;
    option: OptionModel;
    availability: BookingAvailability;
    contact: Contact;
    unitItems: UnitItem[];
  }) {
    this.id = id;
    this.uuid = uuid;
    this.testMode = true;
    this.resellerReference = resellerReference;
    this.supplierReference = supplierReference;
    this.status = status;
    this.utcCreatedAt = new Date().toISOString();
    this.utcUpdatedAt = null;
    this.utcExpiresAt = null;
    this.utcRedeemedAt = null;
    this.utcConfirmedAt = null;
    this.productId = product.id;
    this.product = product;
    this.optionId = option.id;
    this.option = option;
    this.cancellable = true;
    this.cancellation = null;
    this.freesale = false;
    this.availabilityId = availability.id;
    this.availability = availability;
    this.contact = contact;
    this.notes = null;
    this.deliveryMethods = product.deliveryMethods;
    if (product.deliveryMethods.includes(DeliveryMethod.VOUCHER)) {
      this.voucher = {
        redemptionMethod: product.redemptionMethod,
        utcRedeemedAt: null,
        deliveryOptions: product.deliveryFormats.map((format) => ({
          deliveryFormat: format,
          deliveryValue: "",
        })),
      };
    }
    this.unitItems = unitItems;
  }

  public addContent = (): BookingModel => {
    this.capabilities.push(CapabilityId.Content);
    this.bookingContentModel = new BookingContentModel();
    return this;
  };

  public addPricing = (): BookingModel => {
    this.capabilities.push(CapabilityId.Pricing);
    const pricing = {
      original: 0,
      retail: 0,
      net: 0,
      currency: "USD",
      currencyPrecision: 0,
      includedTaxes: [],
    };
    this.bookingPricingModel = new BookingPricingModel(pricing);
    return this;
  };

  public addPickup = (): BookingModel => {
    this.capabilities.push(CapabilityId.Pickups);
    return this;
  };

  public toPOJO = (): Booking => {
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
      unitItems,
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
      product: product.toPOJO(),
      optionId,
      option: option.toPOJO(),
      cancellable,
      cancellation,
      freesale,
      availabilityId,
      availability,
      contact,
      notes,
      deliveryMethods,
      voucher,
      unitItems,
    };

    if (this.capabilities.includes(CapabilityId.Content)) {
      Object.keys(this.bookingContentModel).forEach((key) => {
        pojo[key] = this.bookingContentModel[key];
      });
    }

    if (this.capabilities.includes(CapabilityId.Pricing)) {
      pojo.pricing = this.bookingPricingModel.pricing;
    }

    if (this.capabilities.includes(CapabilityId.Pickups)) {
      Object.keys(this.bookingPickupModel).forEach((key) => {
        pojo[key] = this.bookingPickupModel[key];
      });
    }

    return pojo;
  };
}
