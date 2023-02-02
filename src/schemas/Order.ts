import * as yup from "yup";
import {
  RetrieveOrderPathParamsSchema,
  retrieveOrderPathParamsSchema,
  CreateOrderBodySchema,
  createOrderBodySchema,
  OrderConfirmationBodySchema,
  OrderConfirmationPathParamsSchema,
  orderConfirmationBodySchema,
  orderConfirmationPathParamsSchema,
  OrderCancellationBodySchema,
  OrderCancellationPathParamsSchema,
  orderCancellationBodySchema,
  orderCancellationPathParamsSchema,
  ExtendOrderBodySchema,
  ExtendOrderPathParamsSchema,
  extendOrderBodySchema,
  extendOrderPathParamsSchema,
} from "@octocloud/types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetOrderSchema extends RetrieveOrderPathParamsSchema {}

export const getOrderSchema: yup.SchemaOf<GetOrderSchema> =
  retrieveOrderPathParamsSchema.clone();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateOrderSchema extends CreateOrderBodySchema {}

export const createOrderSchema = createOrderBodySchema.clone();

export interface ConfirmOrderSchema
  extends OrderConfirmationBodySchema,
    OrderConfirmationPathParamsSchema {}

export const confirmOrderSchema: yup.SchemaOf<ConfirmOrderSchema> = yup
  .object()
  .shape({
    ...orderConfirmationBodySchema.fields,
    ...orderConfirmationPathParamsSchema.fields,
  });

export interface CancelOrderSchema
  extends OrderCancellationBodySchema,
    OrderCancellationPathParamsSchema {}

export const cancelOrderSchema: yup.SchemaOf<CancelOrderSchema> = yup
  .object()
  .shape({
    ...orderCancellationBodySchema.fields,
    ...orderCancellationPathParamsSchema.fields,
  });

export interface ExtendOrderSchema
  extends ExtendOrderBodySchema,
    ExtendOrderPathParamsSchema {}

export const extendOrderSchema: yup.SchemaOf<ExtendOrderSchema> = yup
  .object()
  .shape({
    ...extendOrderBodySchema.fields,
    ...extendOrderPathParamsSchema.fields,
  });
