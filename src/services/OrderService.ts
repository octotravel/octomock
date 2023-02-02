import { OrderStatus } from "@octocloud/types";
import { DateHelper } from "../helpers/DateHelper";
import { OrderModel } from "@octocloud/generators";
import { ContactFactory } from "../factories/ContactFactory";
import addMinutes from "date-fns/addMinutes";
import {
  ConfirmOrderSchema,
  CancelOrderSchema,
  ExtendOrderSchema,
} from "../schemas/Order";

interface IOrderService {
  updateOrderModelWithConfirmOrderSchema(
    orderModel: OrderModel,
    confirmOrderSchema: ConfirmOrderSchema
  ): OrderModel;
  updateOrderModelWithExtendOrderSchema(
    orderModel: OrderModel,
    extendBookingSchema: ExtendOrderSchema
  ): OrderModel;
  updateOrderModelWithCancelOrderSchema(
    orderModel: OrderModel,
    schema: CancelOrderSchema
  ): OrderModel;
}

export class OrderService implements IOrderService {
  public updateOrderModelWithConfirmOrderSchema(
    orderModel: OrderModel,
    confirmOrderSchema: ConfirmOrderSchema
  ): OrderModel {
    orderModel.status = OrderStatus.CONFIRMED;
    orderModel.contact = ContactFactory.createForOrder({
      orderModel: orderModel,
      orderContactScheme: confirmOrderSchema.contact,
    });
    orderModel.utcExpiresAt = null;
    orderModel.utcConfirmedAt = DateHelper.utcDateFormat(new Date());

    return orderModel;
  }

  public updateOrderModelWithExtendOrderSchema(
    orderModel: OrderModel,
    extenOrderSchema: ExtendOrderSchema
  ): OrderModel {
    orderModel.status = OrderStatus.ON_HOLD;
    orderModel.utcExpiresAt = DateHelper.utcDateFormat(
      addMinutes(new Date(), extenOrderSchema.expirationMinutes ?? 30)
    );
    orderModel.utcConfirmedAt = null;

    return orderModel;
  }

  public updateOrderModelWithCancelOrderSchema(
    orderModel: OrderModel,
    schema: CancelOrderSchema
  ): OrderModel {
    let status = OrderStatus.EXPIRED;

    if (orderModel.status === OrderStatus.CONFIRMED) {
      status = OrderStatus.CANCELLED;
    }

    orderModel.status = status;
    orderModel.cancellable = false;

    // TODO update bookings

    return orderModel;
  }
}
