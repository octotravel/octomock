import { AvailabilityType } from "./Availability";
import { PickupPoint } from "./PickupPoint";
import { Pricing, PricingPer } from "./Pricing";
import { Option } from "./Option";

export enum DeliveryFormat {
  PDF_URL = "PDF_URL",
  QRCODE = "QRCODE",
}

export enum DeliveryMethod {
  VOUCHER = "VOUCHER",
  TICKET = "TICKET",
}

export enum RedemptionMethod {
  DIGITAL = "DIGITAL",
  PRINT = "PRINT",
}

export type Image = {
  url: string;
  title: Nullable<string>;
  caption: Nullable<string>;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  contact: DestinationContact;
};

type DestinationContact = {
  website: Nullable<string>;
  email: Nullable<string>;
  telephone: Nullable<string>;
  address: Nullable<string>;
};

export type Category = {
  id: string;
  default: boolean;
  title: string;
  shortDescription: string;
  coverImageUrl: Nullable<string>;
  bannerImageUrl: Nullable<string>;
};

export interface Product extends ProductContent, ProductPricing, ProductPickup {
  id: string;
  internalName: string;
  reference: Nullable<string>;
  locale: string;
  timeZone: string;
  allowFreesale: boolean;
  instantConfirmation: boolean;
  instantDelivery: boolean;
  availabilityRequired: boolean;
  availabilityType: AvailabilityType;
  deliveryFormats: Array<DeliveryFormat>;
  deliveryMethods: Array<DeliveryMethod>;
  redemptionMethod: RedemptionMethod;
  options: Array<Option>;
}

export interface ProductContent {
  title?: string;
  country?: string;
  location?: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  highlights?: Array<string>;
  inclusions?: Array<string>;
  exclusions?: Array<string>;
  bookingTerms?: Nullable<string>;
  redemptionInstructions?: Nullable<string>;
  cancellationPolicy?: Nullable<string>;
  destination?: Destination;
  categories?: Array<Category>;
  faqs?: Array<FAQ>;
  coverImageUrl?: Nullable<string>;
  bannerImageUrl?: Nullable<string>;
  videoUrl?: Nullable<string>;
  galleryImages?: Array<Image>;
  bannerImages?: Array<Image>;
}

interface ProductPricing {
  defaultCurrency?: string;
  availableCurrencies?: Array<string>;
  pricingPer?: PricingPer;
  pricingFrom?: Pricing;
  pricing?: Pricing;
}

interface ProductPickup {
  pickupAvailable?: boolean;
  pickupRequired?: boolean;
  pickupPoints?: PickupPoint[];
}
