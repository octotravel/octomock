import { CapabilityId, Order, OrderStatus } from '@octocloud/types';
import { OrderParser, BookingModel } from '@octocloud/generators';
import OrderRepository from '../repositories/OrderRepository';
import {
  CreateOrderSchema,
  ConfirmOrderSchema,
  ExtendOrderSchema,
  CancelOrderSchema,
  GetOrderSchema,
} from '../schemas/Order';
import { OrderModelFactory } from '../factories/OrderModelFactory';
import { OrderService } from '../services/OrderService';
import { UnprocessableEntityError } from '../models/Error';
import { BookingService } from '../services/BookingService';
import { BookingRepository } from '../repositories/BookingRepository';

interface IOrderController {
  createOrder: (schema: CreateOrderSchema, capabilities: CapabilityId[]) => Promise<Order>;
  confirmOrder: (schema: ConfirmOrderSchema, capabilities: CapabilityId[]) => Promise<Order>;
  extendOrder: (schema: ExtendOrderSchema, capabilities: CapabilityId[]) => Promise<Order>;
  cancelOrder: (schema: CancelOrderSchema, capabilities: CapabilityId[]) => Promise<Order>;
  getOrder: (schema: GetOrderSchema, capabilities: CapabilityId[]) => Promise<Order>;
}

export class OrderController implements IOrderController {
  private readonly orderRepository = new OrderRepository();

  private readonly orderService = new OrderService();

  private readonly bookingRepository = new BookingRepository();

  private readonly bookingService = new BookingService();

  private readonly orderParser = new OrderParser();

  public createOrder = async (schema: CreateOrderSchema, capabilities: CapabilityId[]): Promise<Order> => {
    const orderModel = OrderModelFactory.createBySchema(schema);
    const createdOrderModel = await this.orderRepository.createOrder(orderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(createdOrderModel, capabilities);
  };

  public confirmOrder = async (schema: ConfirmOrderSchema, capabilities: CapabilityId[]): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (orderModel.status === OrderStatus.CONFIRMED) {
      return this.orderParser.parseModelToPOJOWithSpecificCapabilities(orderModel, capabilities);
    }

    const confirmedBookingModels: BookingModel[] = [];
    orderModel.bookingModels.forEach(async (bookingModel) => {
      const confirmedBookingModel = this.bookingService.confirmBookingByOrder(bookingModel, schema);
      await this.bookingRepository.updateBooking(confirmedBookingModel);
      confirmedBookingModels.push(confirmedBookingModel);
    });

    const confirmedOrderModel = this.orderService.confirmOrderBySchema(orderModel, confirmedBookingModels, schema);
    await this.orderRepository.updateOrder(confirmedOrderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(confirmedOrderModel, capabilities);
  };

  public extendOrder = async (schema: ExtendOrderSchema, capabilities: CapabilityId[]): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (orderModel.status !== OrderStatus.ON_HOLD) {
      throw new UnprocessableEntityError('Order cannot be extended');
    }

    const extendedOrderModel = this.orderService.extendOrderBySchema(orderModel, schema);
    await this.orderRepository.updateOrder(extendedOrderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(extendedOrderModel, capabilities);
  };

  public cancelOrder = async (schema: CancelOrderSchema, capabilities: CapabilityId[]): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (!orderModel.cancellable) {
      throw new UnprocessableEntityError('Order cannot be cancelled');
    }

    if (orderModel.status === OrderStatus.CANCELLED) {
      return this.orderParser.parseModelToPOJOWithSpecificCapabilities(orderModel, capabilities);
    }

    const cancelledBookingModels: BookingModel[] = [];
    orderModel.bookingModels.forEach(async (bookingModel) => {
      const cancelledBookingModel = this.bookingService.cancelBookingByOrder(bookingModel, orderModel, schema);
      await this.bookingRepository.updateBooking(cancelledBookingModel);
      cancelledBookingModels.push(cancelledBookingModel);
    });

    const cancelledOrderModel = this.orderService.cancelOrderBySchema(orderModel, cancelledBookingModels);
    await this.orderRepository.updateOrder(cancelledOrderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(cancelledOrderModel, capabilities);
  };

  public getOrder = async (schema: GetOrderSchema, capabilities: CapabilityId[]): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(orderModel, capabilities);
  };
}
