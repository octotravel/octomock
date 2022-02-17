import { CapabilityId } from "./../types/Capability";
import { CapableToPOJOType, Capable } from "./../interfaces/Capable";
import { ProductPricingModel } from "./ProductPricing";
import { ProductPickupModel } from "./ProductPickup";
import { ProductContentModel } from "./ProductContent";
import { Currency } from "./../types/Currency";
import { PricingPer } from "../types/Pricing";
import { OptionModel } from "./../models/Option";
import { Product } from "./../types/Product";
import { AvailabilityType } from "../types/Availability";
import {
  DeliveryFormat,
  DeliveryMethod,
  RedemptionMethod,
} from "../types/Product";
import { AvailabilityConfigModel } from "./AvailabilityConfig";

export class ProductModel implements Capable {
  public id: string;
  public internalName: string;
  public reference: Nullable<string>;
  public locale: string;
  public timeZone: string;
  public allowFreesale: boolean;
  public instantConfirmation: boolean;
  public instantDelivery: boolean;
  public availabilityRequired: boolean;
  public availabilityType: AvailabilityType;
  public deliveryFormats: Array<DeliveryFormat>;
  public deliveryMethods: Array<DeliveryMethod>;
  public redemptionMethod: RedemptionMethod;
  public options: OptionModel[];
  public productContentModel?: ProductContentModel;
  public productPickupModel?: ProductPickupModel;
  public productPricingModel?: ProductPricingModel;
  public availabilityConfig: AvailabilityConfigModel;

  constructor({
    id,
    internalName,
    availabilityType,
    pricingPer,
    currency,
    availabilityConfig,
    options,
    deliveryMethods,
  }: {
    id: string;
    internalName: string;
    availabilityType: AvailabilityType;
    options: OptionModel[];
    pricingPer: PricingPer;
    currency: Currency;
    availabilityConfig: AvailabilityConfigModel;
    deliveryMethods: DeliveryMethod[];
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
    this.deliveryMethods = deliveryMethods;
    this.redemptionMethod = RedemptionMethod.DIGITAL;
    this.options = options;
    this.availabilityConfig = availabilityConfig;
    this.productContentModel = new ProductContentModel();
    this.productPricingModel = new ProductPricingModel(pricingPer, currency);
    this.productPickupModel = new ProductPickupModel();
  }

  public getOption = (id: string): Nullable<OptionModel> => {
    return this.options.find((option) => option.id === id) ?? null;
  };

  public setOnBooking = (): ProductModel => {
    this.options = this.options.map((model) => model.setOnBooking());
    return this;
  };

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): Product => {
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
      options: options.map((option) =>
        option.toPOJO({ useCapabilities, capabilities })
      ),
    };

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Content))
    ) {
      Object.keys(this.productContentModel).forEach((key) => {
        pojo[key] = this.productContentModel[key];
      });
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      pojo.defaultCurrency = this.productPricingModel.defaultCurrency;
      pojo.availableCurrencies = this.productPricingModel.availableCurrencies;
      pojo.pricingPer = this.productPricingModel.pricingPer;
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pickups))
    ) {
      Object.keys(this.productPickupModel).forEach((key) => {
        pojo[key] = this.productPickupModel[key];
      });
    }

    return pojo;
  };

  public static fromPOJO = (product: Product): ProductModel => {
    return new ProductModel({
      id: product.id,
      internalName: product.internalName,
      availabilityType: product.availabilityType,
      options: product.options.map((o) => OptionModel.fromPOJO(o)),
      pricingPer: product.pricingPer,
      currency: product.defaultCurrency as Currency,
      availabilityConfig: new AvailabilityConfigModel({}),
      deliveryMethods: product.deliveryMethods,
    });
  };
}
