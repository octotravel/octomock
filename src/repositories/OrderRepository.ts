import { DB } from "../storage/Database";
import { DateHelper } from "../helpers/DateFormatter";
import { Order } from "@octocloud/types";
import { GetOrderSchema } from "../schemas/Order";
import InvalidOrderIdError from "../errors/InvalidOrderIdError";
import { OrderModel, OrderParser, BookingModel } from "@octocloud/generators";
import { BookingRepository } from "./BookingRepository";

interface IOrderRepository {
  createOrder(orderModel: OrderModel): Promise<OrderModel>;
  updateOrder(orderModel: OrderModel): Promise<OrderModel>;
  getOrder(orderModel: OrderModel): Promise<OrderModel>;
}

export default class OrderRepository implements IOrderRepository {
  private readonly orderParser = new OrderParser();
  private readonly BookingRepository = new BookingRepository();

  public createOrder = async (orderModel: OrderModel): Promise<OrderModel> => {
    await DB.getInstance()
      .getDB()
      .run(
        `
        INSERT INTO booking (
          id,
          status,
          supplierReference
          data
        ) VALUES (?, ?, ?, ?)
    `,
        orderModel.id,
        orderModel.status,
        orderModel.supplierReference,
        JSON.stringify(this.orderParser.parseModelToPOJO(orderModel))
      );

    return orderModel;
  };

  public updateOrder = async (orderModel: OrderModel): Promise<OrderModel> => {
    await DB.getInstance()
      .getDB()
      .run(
        `
        UPDATE booking
          SET status = ?,
              supplierReference = ?,
              data = ?
          WHERE id = ?
    `,
        orderModel.status,
        orderModel.supplierReference,

        JSON.stringify(this.orderParser.parseModelToPOJO(orderModel)),
        orderModel.id
      );
    return orderModel;
  };

  public getOrder = async (getOrderSchema: GetOrderSchema): Promise<OrderModel> => {
    return this.getOrderById(getOrderSchema.id);
  };

  public getOrderById = async (orderId: string): Promise<OrderModel> => {
    const result = (await DB.getInstance().getDB().get(`SELECT * FROM order WHERE id = ?`, orderId)) ?? null;

    if (result === null) {
      throw new InvalidOrderIdError(orderId);
    }
    const order = JSON.parse(result.data) as Order;
    this.handleExpiredOrder(order);

    const orderModel = this.orderParser.parsePOJOToModel(order);
    const upToDateBookingModels = this.getUpToDateBookingModels(orderModel);
    orderModel.bookingModels = upToDateBookingModels;

    return orderModel;
  };

  private handleExpiredOrder = (order: Order): void => {
    if (order.utcExpiresAt !== null && order.utcExpiresAt < DateHelper.utcDateFormat(new Date())) {
      throw new InvalidOrderIdError(order.id);
    }
  };

  private getUpToDateBookingModels = (orderModel: OrderModel): BookingModel[] => {
    const upToDateBookingModels: BookingModel[] = [];

    orderModel.bookingModels.forEach(async (bookingModel) => {
      const upToDateBookingModel = await this.BookingRepository.getBookingByUuid(bookingModel.uuid);
      upToDateBookingModels.push(upToDateBookingModel);
    });

    return upToDateBookingModels;
  };
}
