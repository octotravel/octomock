import { DB } from "../storage/Database";
import { DateHelper } from "../helpers/DateHelper";
import { Order } from "@octocloud/types";
import { GetOrderSchema } from "../schemas/Order";
import InvalidOrderIdError from "../errors/InvalidOrderIdError";
import { OrderModel, OrderParser } from "@octocloud/generators";

interface IOrderRepository {
  createOrder(orderModel: OrderModel): Promise<OrderModel>;
  updateOrder(orderModel: OrderModel): Promise<OrderModel>;
  getOrder(orderModel: OrderModel): Promise<OrderModel>;
}

export default class OrderRepository implements IOrderRepository {
  private readonly orderParser = new OrderParser();

  public createOrder = async (orderModel: OrderModel): Promise<OrderModel> => {
    await DB.getInstance()
      .getDB()
      .run(
        `
        INSERT INTO booking (
          id,
          status,
          supplierReference,
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

  public getOrder = async (
    getOrderSchema: GetOrderSchema
  ): Promise<OrderModel> => {
    const result =
      (await DB.getInstance()
        .getDB()
        .get(`SELECT * FROM order WHERE id = ?`, getOrderSchema.id)) ?? null;

    if (result === null) {
      throw new InvalidOrderIdError(getOrderSchema.id);
    }
    const order = JSON.parse(result.data) as Order;
    this.handleExpiredOrder(order);

    return this.orderParser.parsePOJOToModel(order);
  };

  private handleExpiredOrder = (order: Order): void => {
    if (
      order.utcExpiresAt !== null &&
      order.utcExpiresAt < DateHelper.utcDateFormat(new Date())
    ) {
      throw new InvalidOrderIdError(order.id);
    }
  };
}
