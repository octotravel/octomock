import { UnitId } from "./../types/Unit";
import * as yup from "yup";

export type OctoUnitItem = {
  uuid?: string;
  unitId: UnitId;
  resellerReference?: string;
};

type Capabilities = {
  // octo/adjustments
  adjustments?: Array<{
    per?: string;
    amount: number;
    quantity?: number;
    notes?: string;
  }>;
  // octo/cart
  orderId?: string;
  // octo/offers
  offerCode?: string;
  // octo/pickups
  pickupRequested?: boolean;
  pickupPointId?: string;
  pickupHotel?: string;
};

export type Contact = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  country?: string;
  notes?: string;
  locales?: Array<string>;
};

export type CreateBookingSchema = Capabilities & {
  uuid?: string;
  resellerReference?: string;
  productId: string;
  optionId: string;
  availabilityId: string;
  expirationMinutes?: number;
  freesale?: boolean;
  redeemed?: boolean;
  notes?: string;
  emailReceipt?: boolean;
  unitItems: OctoUnitItem[];
  contact?: Contact;
};

export type UpdateBookingSchema = Capabilities & {
  uuid: string;
  resellerReference?: string;
  productId?: string;
  optionId?: string;
  availabilityId?: string;
  expirationMinutes?: number;
  freesale?: boolean;
  redeemed?: boolean;
  notes?: string;
  emailReceipt?: boolean;
  unitItems?: OctoUnitItem[];
  contact?: Contact;
};

export type ConfirmBookingSchema = UpdateBookingSchema;

export type CancelBookingSchema = {
  uuid: string;
  reason?: string;
  force?: boolean;
};

export type ExtendBookingSchema = {
  uuid: string;
  expirationMinutes?: number;
};

export type GetBookingSchema = {
  uuid: string;
};

export type GetBookingsSchema = {
  resellerReference?: string;
  supplierReference?: string;
};

export const createBookingSchema: yup.SchemaOf<CreateBookingSchema> =
  yup.object({
    uuid: yup.string().notRequired(),
    resellerReference: yup.string().notRequired(),
    productId: yup.string().required(),
    optionId: yup.string().required(),
    availabilityId: yup.string().required(),
    expirationMinutes: yup.number().integer().notRequired(),
    freesale: yup.bool().notRequired(),
    redeemed: yup.bool().notRequired(),
    notes: yup.string().notRequired(),
    emailReceipt: yup.bool().notRequired(),
    unitItems: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().notRequired(),
          unitId: yup.mixed().oneOf(Object.values(UnitId)).required(),
          resellerReference: yup.string().notRequired(),
        })
      )
      .required(),
    contact: yup
      .object({
        fullName: yup.string().notRequired(),
        firstName: yup.string().notRequired(),
        lastName: yup.string().notRequired(),
        emailAddress: yup.string().notRequired(),
        phoneNumber: yup.string().notRequired(),
        country: yup.string().notRequired(),
        notes: yup.string().notRequired(),
        locales: yup.array().of(yup.string()).notRequired(),
      })
      .notRequired()
      .default(undefined),
    // octo/adjustments
    adjustments: yup
      .array()
      .of(
        yup.object({
          per: yup.string().notRequired(),
          amount: yup.number().integer().required(),
          quantity: yup.number().integer().notRequired(),
          notes: yup.string().notRequired(),
        })
      )
      .notRequired(),
    // octo/cart
    orderId: yup.string().notRequired(),
    // octo/offers
    offerCode: yup.string().notRequired(),
    // octo/pickups
    pickupRequested: yup.bool().notRequired(),
    pickupPointId: yup.string().notRequired(),
    pickupHotel: yup.string().notRequired(),
  });

export const patchBookingSchema: yup.SchemaOf<UpdateBookingSchema> = yup.object(
  {
    uuid: yup.string().required(),
    resellerReference: yup.string().notRequired(),
    productId: yup.string().notRequired(),
    optionId: yup.string().notRequired(),
    availabilityId: yup.string().notRequired(),
    expirationMinutes: yup.number().integer().notRequired(),
    freesale: yup.bool().notRequired(),
    redeemed: yup.bool().notRequired(),
    notes: yup.string().notRequired(),
    emailReceipt: yup.bool().notRequired(),
    unitItems: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().notRequired(),
          unitId: yup.string().required(),
          resellerReference: yup.string().notRequired(),
        })
      )
      .notRequired(),
    contact: yup
      .object({
        fullName: yup.string().notRequired(),
        firstName: yup.string().notRequired(),
        lastName: yup.string().notRequired(),
        emailAddress: yup.string().notRequired(),
        phoneNumber: yup.string().notRequired(),
        country: yup.string().notRequired(),
        notes: yup.string().notRequired(),
        locales: yup.array().of(yup.string()).notRequired(),
      })
      .notRequired(),
    // octo/adjustments
    adjustments: yup
      .array()
      .of(
        yup.object({
          per: yup.string().notRequired(),
          amount: yup.number().integer().required(),
          quantity: yup.number().integer().notRequired(),
          notes: yup.string().notRequired(),
        })
      )
      .notRequired(),
    // octo/cart
    orderId: yup.string().notRequired(),
    // octo/offers
    offerCode: yup.string().notRequired(),
    // octo/pickups
    pickupRequested: yup.bool().notRequired(),
    pickupPointId: yup.string().notRequired(),
    pickupHotel: yup.string().notRequired(),
  }
);

export const getBookingSchema: yup.SchemaOf<GetBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
  });

export const confirmBookingSchema: yup.SchemaOf<ConfirmBookingSchema> =
  patchBookingSchema.clone();

export const cancelBookingSchema: yup.SchemaOf<CancelBookingSchema> =
  yup.object({
    uuid: yup.string().required(),
    reason: yup.string().notRequired(),
    force: yup.boolean().notRequired(),
  });

export const extendBookingSchema: yup.SchemaOf<ExtendBookingSchema> =
  yup.object({
    uuid: yup.string().required(),
    expirationMinutes: yup.number().integer().notRequired(),
  });

export const getBookingsSchema: yup.SchemaOf<GetBookingsSchema> = yup
  .object()
  .shape({
    resellerReference: yup.string().notRequired(),
    supplierReference: yup.string().notRequired(),
  })
  .required();
