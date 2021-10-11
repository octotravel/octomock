import { ProductPricingModel } from "./ProductPricing";
import { ProductPickupModel } from "./ProductPickup";
import { ProductContentModel } from "./ProductContent";
import { Currency } from "./../types/Currency";
import { PricingPer } from "../types/Pricing";
import { OptionModel } from "./../models/Option";
import { Product } from "./../types/Product";
import { CapabilityId } from "../types/Capability";
import { AvailabilityType } from "../types/Availability";
import {
  DeliveryFormat,
  DeliveryMethod,
  RedemptionMethod,
} from "../types/Product";

export class ProductModel {
  public id: string;
  private internalName: string;
  private reference: Nullable<string>;
  private locale: string;
  private timeZone: string;
  private allowFreesale: boolean;
  private instantConfirmation: boolean;
  private instantDelivery: boolean;
  private availabilityRequired: boolean;
  private availabilityType: AvailabilityType;
  public deliveryFormats: Array<DeliveryFormat>;
  public deliveryMethods: Array<DeliveryMethod>;
  public redemptionMethod: RedemptionMethod;
  private options: OptionModel[];
  private productContentModel?: ProductContentModel;
  private productPickupModel?: ProductPickupModel;
  private productPricingModel?: ProductPricingModel;

  private capabilities: CapabilityId[] = [];

  constructor({
    id,
    internalName,
    availabilityType,
    options,
  }: {
    id: string;
    internalName: string;
    availabilityType: AvailabilityType;
    options: OptionModel[];
  }) {
    this.id = id;
    this.internalName = internalName;
    this.reference = null;
    this.locale = "en";
    this.timeZone = "Europe/London";
    this.allowFreesale = false;
    this.instantConfirmation = true;
    this.instantDelivery = true;
    this.availabilityRequired = true;
    this.availabilityType = availabilityType;
    this.deliveryFormats = [DeliveryFormat.PDF_URL, DeliveryFormat.QRCODE];
    this.deliveryMethods = [DeliveryMethod.VOUCHER, DeliveryMethod.TICKET];
    this.redemptionMethod = RedemptionMethod.DIGITAL;
    this.options = options;
  }

  public addContent = (): ProductModel => {
    this.capabilities.push(CapabilityId.Content);
    this.productContentModel = new ProductContentModel();
    return this;
  };

  public addPricing = (
    pricingPer: PricingPer,
    currency: Currency
  ): ProductModel => {
    this.capabilities.push(CapabilityId.Pricing);
    this.productPricingModel = new ProductPricingModel(pricingPer, currency);
    return this;
  };

  public addPickup = (): ProductModel => {
    this.capabilities.push(CapabilityId.Pickups);
    this.productPickupModel = new ProductPickupModel();
    return this;
  };

  public toPOJO = (): Product => {
    const {
      id,
      internalName,
      reference,
      locale,
      timeZone,
      allowFreesale,
      instantConfirmation,
      instantDelivery,
      availabilityRequired,
      availabilityType,
      deliveryFormats,
      deliveryMethods,
      redemptionMethod,
      options,
    } = this;
    const pojo: Product = {
      id,
      internalName,
      reference,
      locale,
      timeZone,
      allowFreesale,
      instantConfirmation,
      instantDelivery,
      availabilityRequired,
      availabilityType,
      deliveryFormats,
      deliveryMethods,
      redemptionMethod,
      options: options.map((option) => option.toPOJO()),
    };

    if (this.capabilities.includes(CapabilityId.Content)) {
      Object.keys(this.productContentModel).forEach((key) => {
        pojo[key] = this.productContentModel[key];
      });
    }

    if (this.capabilities.includes(CapabilityId.Pricing)) {
      pojo.defaultCurrency = this.productPricingModel.defaultCurrency;
      pojo.availableCurrencies = this.productPricingModel.availableCurrencies;
      pojo.pricingPer = this.productPricingModel.pricingPer;
      if (this.productPricingModel.pricingPer === PricingPer.BOOKING) {
        pojo.pricingFrom = this.productPricingModel.pricingFrom;
      }
    }

    if (this.capabilities.includes(CapabilityId.Pickups)) {
      Object.keys(this.productPickupModel).forEach((key) => {
        pojo[key] = this.productPickupModel[key];
      });
    }

    return pojo;
  };
}
