import * as yup from "yup";
import {
  CreateBookingSchema as BaseCreateBookingSchema,
  createBookingSchema as baseCreateBookingSchema,
  ConfirmBookingSchema as BaseConfirmBookingSchema,
  confirmBookingSchema as baseConfirmBookingSchema,
  UpdateBookingSchema as BaseUpdateBookingSchema,
  updateBookingSchema as baseUpdateBookingSchema,
  CancelBookingSchema as BaseCancelBookingSchema,
  cancelBookingSchema as baseCancelBookingSchema,
  ExtendBookingSchema as BaseExtendBookingSchema,
  extendBookingSchema as baseExtendBookingSchema,
} from "@octocloud/types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateBookingSchema extends BaseCreateBookingSchema {}

export const createBookingSchema = baseCreateBookingSchema.clone();

export interface ConfirmBookingSchema extends BaseConfirmBookingSchema {
  uuid: string;
}

export const confirmBookingSchema: yup.SchemaOf<ConfirmBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
    ...baseConfirmBookingSchema.fields,
  });

export interface UpdateBookingSchema extends BaseUpdateBookingSchema {
  uuid: string;
}

export const updateBookingSchema: yup.SchemaOf<UpdateBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
    ...baseUpdateBookingSchema.fields,
  });

export interface CancelBookingSchema extends BaseCancelBookingSchema {
  uuid: string;
}

export const cancelBookingSchema: yup.SchemaOf<CancelBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
    ...baseCancelBookingSchema.fields,
  });

export interface ExtendBookingSchema extends BaseExtendBookingSchema {
  uuid: string;
}

export const extendBookingSchema: yup.SchemaOf<ExtendBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
    ...baseExtendBookingSchema.fields,
  });

export type GetBookingSchema = {
  uuid: string;
};

export const getBookingSchema: yup.SchemaOf<GetBookingSchema> = yup
  .object()
  .shape({
    uuid: yup.string().required(),
  });

export type GetBookingsSchema = {
  resellerReference?: string;
  supplierReference?: string;
};

export const getBookingsSchema: yup.SchemaOf<GetBookingsSchema> = yup
  .object()
  .shape({
    resellerReference: yup.string().notRequired(),
    supplierReference: yup.string().notRequired(),
  })
  .required();
