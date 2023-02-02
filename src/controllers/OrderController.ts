import { CapabilityId, Order, OrderStatus } from "@octocloud/types";
import OrderRepository from "../repositories/OrderRepository";
import {
  CreateOrderSchema,
  ConfirmOrderSchema,
  ExtendOrderSchema,
  CancelOrderSchema,
  GetOrderSchema,
} from "../schemas/Order";
import { OrderModelFactory } from "../factories/OrderModelFactory";
import { OrderParser } from "@octocloud/generators";
import { OrderService } from "../services/OrderService";
import { UnprocessableEntityError } from "../models/Error";

interface IOrderController {
  createOrder(
    schema: CreateOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order>;
  confirmOrder(
    schema: ConfirmOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order>;
  extendOrder(
    schema: ExtendOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order>;
  cancelOrder(
    schema: CancelOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order>;
  getOrder(
    schema: GetOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order>;
}

export class OrderController implements IOrderController {
  private readonly orderRepository = new OrderRepository();
  private readonly orderService = new OrderService();
  private readonly orderParser = new OrderParser();

  public createOrder = async (
    schema: CreateOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order> => {
    const orderModel = OrderModelFactory.create(schema);
    const createdOrderModel = await this.orderRepository.createOrder(
      orderModel
    );

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
      createdOrderModel,
      capabilities
    );
  };

  public confirmOrder = async (
    schema: ConfirmOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (orderModel.status === OrderStatus.CONFIRMED) {
      return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
        orderModel,
        capabilities
      );
    }

    const confirmedOrderModel =
      this.orderService.updateOrderModelWithConfirmOrderSchema(
        orderModel,
        schema
      );
    await this.orderRepository.updateOrder(confirmedOrderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
      confirmedOrderModel,
      capabilities
    );
  };

  public extendOrder = async (
    schema: ExtendOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (orderModel.status !== OrderStatus.ON_HOLD) {
      throw new UnprocessableEntityError("Order cannot be extended");
    }

    const extendedOrderModel =
      this.orderService.updateOrderModelWithExtendOrderSchema(
        orderModel,
        schema
      );
    await this.orderRepository.updateOrder(extendedOrderModel);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
      extendedOrderModel,
      capabilities
    );
  };

  public cancelOrder = async (
    schema: CancelOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    if (orderModel.cancellable === false) {
      throw new UnprocessableEntityError("Order cannot be cancelled");
    }

    if (orderModel.status === OrderStatus.CANCELLED) {
      return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
        orderModel,
        capabilities
      );
    }

    const cancelledOrder =
      this.orderService.updateOrderModelWithCancelOrderSchema(
        orderModel,
        schema
      );
    await this.orderRepository.updateOrder(cancelledOrder);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
      cancelledOrder,
      capabilities
    );
  };

  public getOrder = async (
    schema: GetOrderSchema,
    capabilities: CapabilityId[]
  ): Promise<Order> => {
    const orderModel = await this.orderRepository.getOrder(schema);

    return this.orderParser.parseModelToPOJOWithSpecificCapabilities(
      orderModel,
      capabilities
    );
  };
}
