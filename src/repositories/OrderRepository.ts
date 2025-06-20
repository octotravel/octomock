import { BookingModel, OrderModel, OrderParser } from '@octocloud/generators';
import { Order } from '@octocloud/types';
import InvalidOrderIdError from '../errors/InvalidOrderIdError';
import { DateHelper } from '../helpers/DateFormatter';
import { GetOrderSchema } from '../schemas/Order';
import { DB } from '../storage/Database';
import { BookingRepository } from './BookingRepository';

interface IOrderRepository {
  createOrder: (orderModel: OrderModel) => Promise<OrderModel>;
  updateOrder: (orderModel: OrderModel) => Promise<OrderModel>;
  getOrder: (orderModel: OrderModel) => Promise<OrderModel>;
}

export default class OrderRepository implements IOrderRepository {
  private readonly orderParser = new OrderParser();

  private readonly BookingRepository = new BookingRepository();

  public createOrder = async (orderModel: OrderModel): Promise<OrderModel> => {
    const db = await DB.getInstance().getDB();

    db.prepare(
      `
        INSERT INTO \`order\` (
          id,
          status,
          supplierReference,
          data
        ) VALUES (?, ?, ?, ?)
    `,
    ).run(
      orderModel.id,
      orderModel.status,
      orderModel.supplierReference,
      JSON.stringify(this.orderParser.parseModelToPOJO(orderModel)),
    );

    return orderModel;
  };

  public updateOrder = async (orderModel: OrderModel): Promise<OrderModel> => {
    const db = await DB.getInstance().getDB();

    db.prepare(
      `
        UPDATE \`order\`
          SET status = ?,
              supplierReference = ?,
              data = ?
          WHERE id = ?
    `,
    ).run(
      orderModel.status,
      orderModel.supplierReference,
      JSON.stringify(this.orderParser.parseModelToPOJO(orderModel)),
      orderModel.id,
    );
    return orderModel;
  };

  public getOrder = async (getOrderSchema: GetOrderSchema): Promise<OrderModel> =>
    await this.getOrderById(getOrderSchema.id);

  public getOrderById = async (orderId: string): Promise<OrderModel> => {
    const db = await DB.getInstance().getDB();

    // biome-ignore lint/suspicious/noExplicitAny: ignored
    const result: any = (await db.prepare('SELECT * FROM `order` WHERE id = ?').get(orderId)) ?? null;

    if (result === null) {
      throw new InvalidOrderIdError(orderId);
    }

    const order = JSON.parse(result.data) as Order;
    this.handleExpiredOrder(order);

    const orderModel = this.orderParser.parsePOJOToModel(order);
    const upToDateBookingModels = this.getUpToDateBookingModels(orderModel);
    orderModel.bookingModels = await upToDateBookingModels;

    return orderModel;
  };

  private readonly handleExpiredOrder = (order: Order): void => {
    if (order.utcExpiresAt !== null && order.utcExpiresAt < DateHelper.utcDateFormat(new Date())) {
      throw new InvalidOrderIdError(order.id);
    }
  };

  private readonly getUpToDateBookingModels = async (orderModel: OrderModel): Promise<BookingModel[]> => {
    const upToDateBookingModels: BookingModel[] = [];

    await Promise.all(
      orderModel.bookingModels.map(async (bookingModel) => {
        const upToDateBookingModel = await this.BookingRepository.getBookingByUuid(bookingModel.uuid);
        upToDateBookingModels.push(upToDateBookingModel);
      }),
    );

    return upToDateBookingModels;
  };
}
