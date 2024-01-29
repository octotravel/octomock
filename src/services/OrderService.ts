import { OrderStatus } from '@octocloud/types';
import { OrderModel, BookingModel } from '@octocloud/generators';
import addMinutes from 'date-fns/addMinutes';
import { DateHelper } from '../helpers/DateFormatter';
import { ContactFactory } from '../factories/ContactFactory';
import { ConfirmOrderSchema, ExtendOrderSchema } from '../schemas/Order';

interface IOrderService {
  confirmOrderBySchema: (
    orderModel: OrderModel,
    confirmedBookingModels: BookingModel[],
    confirmOrderSchema: ConfirmOrderSchema,
  ) => OrderModel;
  extendOrderBySchema: (orderModel: OrderModel, extendBookingSchema: ExtendOrderSchema) => OrderModel;
  cancelOrderBySchema: (orderModel: OrderModel, cancelledBookingModels: BookingModel[]) => OrderModel;
}

export class OrderService implements IOrderService {
  public confirmOrderBySchema(
    orderModel: OrderModel,
    confirmedBookingModels: BookingModel[],
    confirmOrderSchema: ConfirmOrderSchema,
  ): OrderModel {
    orderModel.status = OrderStatus.CONFIRMED;
    orderModel.contact = ContactFactory.createForOrder({
      contact: orderModel.contact,
      orderContactScheme: confirmOrderSchema.contact,
    });
    orderModel.utcExpiresAt = null;
    orderModel.utcConfirmedAt = DateHelper.utcDateFormat(new Date());
    orderModel.bookingModels = confirmedBookingModels;

    return orderModel;
  }

  public extendOrderBySchema(orderModel: OrderModel, extenOrderSchema: ExtendOrderSchema): OrderModel {
    orderModel.status = OrderStatus.ON_HOLD;
    orderModel.utcExpiresAt = DateHelper.utcDateFormat(
      addMinutes(new Date(), extenOrderSchema.expirationMinutes ?? 30),
    );
    orderModel.utcConfirmedAt = null;

    return orderModel;
  }

  public cancelOrderBySchema(orderModel: OrderModel, cancelledBookingModels: BookingModel[]): OrderModel {
    let status = OrderStatus.EXPIRED;

    if (orderModel.status === OrderStatus.CONFIRMED) {
      status = OrderStatus.CANCELLED;
    }

    orderModel.status = status;
    orderModel.cancellable = false;
    orderModel.bookingModels = cancelledBookingModels;

    return orderModel;
  }
}
