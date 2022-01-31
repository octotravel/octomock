import { PickupPoint } from "./PickupPoint";
import { Unit, UnitId } from "./Unit";
import { OpeningHours } from "./Availability";
import { Option } from "./Option";
import {
  DeliveryFormat,
  DeliveryMethod,
  Product,
  RedemptionMethod,
} from "./Product";
import { Pricing } from "./Pricing";

export enum BookingStatus {
  ON_HOLD = "ON_HOLD",
  CONFIRMED = "CONFIRMED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface Booking extends BookingPricing, BookingPickup, BookingContent {
  id: string;
  uuid: string;
  testMode: boolean;
  resellerReference: string;
  supplierReference: string;
  status: BookingStatus;
  utcCreatedAt: string;
  utcUpdatedAt: Nullable<string>;
  utcExpiresAt: Nullable<string>;
  utcRedeemedAt: Nullable<string>;
  utcConfirmedAt: Nullable<string>;
  productId: string;
  product: Product;
  optionId: string;
  option: Option;
  cancellable: boolean;
  cancellation: Nullable<Cancellation>;
  freesale: boolean;
  availabilityId: string;
  availability: BookingAvailability;
  contact: Contact;
  notes: Nullable<string>;
  deliveryMethods: DeliveryMethod[];
  voucher: Voucher;
  unitItems: UnitItem[];
}
export interface Cancellation {
  refund: string;
  reason: Nullable<string>;
  utcCancelledAt: Nullable<string>;
}
export interface BookingAvailability {
  id: string;
  localDateTimeStart: string;
  localDateTimeEnd: string;
  allDay: boolean;
  openingHours: OpeningHours[];
}

export interface Contact {
  fullName: Nullable<string>;
  firstName: Nullable<string>;
  lastName: Nullable<string>;
  emailAddress: Nullable<string>;
  phoneNumber: Nullable<string>;
  locales: string[];
  country: Nullable<string>;
  notes: Nullable<string>;
}

export interface Voucher {
  redemptionMethod: RedemptionMethod;
  utcRedeemedAt: Nullable<string>;
  deliveryOptions: DeliveryOption[];
}

interface Ticket {
  redemptionMethod: RedemptionMethod;
  utcRedeemedAt: Nullable<string>;
  deliveryOptions: DeliveryOption[];
}

export interface DeliveryOption {
  deliveryFormat: DeliveryFormat;
  deliveryValue: string;
}

export interface UnitItem {
  uuid: string;
  resellerReference: Nullable<string>;
  supplierReferecne: Nullable<string>;
  unitId: UnitId;
  unit: Unit;
  status: BookingStatus;
  utcRedeemedAt: Nullable<string>;
  contact: Contact;
  ticket: Ticket;
}

interface BookingPricing {
  pricing?: Pricing;
}

interface BookingPickup {
  pickupRequired?: boolean;
  pickupPoints?: PickupPoint[];
}

interface BookingContent {
  meetingPoint?: Nullable<string>;
  meetingPointCoordinates?: Nullable<[number]>;
  meetingLocalDateTime?: Nullable<string>;
  duration?: string;
  durationAmount?: string;
  durationUnit?: string;
}
