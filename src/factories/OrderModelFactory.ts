import { DateHelper } from "../helpers/DateHelper";
import { addMinutes } from "date-fns";
import { DataGenerator } from "../generators/DataGenerator";
import { CreateOrderSchema } from "../schemas/Order";
import { OrderStatus } from "@octocloud/types";
import { OrderModelGenerator, OrderModel } from "@octocloud/generators";

export abstract class OrderModelFactory {
  private static orderModelGenerator: OrderModelGenerator =
    new OrderModelGenerator();

  public static create(createOrderSchema: CreateOrderSchema): OrderModel {
    const status = OrderStatus.ON_HOLD;

    let utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), 30));
    if (createOrderSchema.expirationMinutes) {
      utcExpiresAt = DateHelper.utcDateFormat(
        addMinutes(new Date(), createOrderSchema.expirationMinutes)
      );
    }

    return this.orderModelGenerator.generateOrder({
      orderData: {
        id: DataGenerator.generateUUID(),
        supplierReference: DataGenerator.generateSupplierReference(),
        settlementMethod: "settlementMethod",
        status: status,
        utcExpiresAt: utcExpiresAt,
        utcConfirmedAt: undefined,
        bookings: [],
        contact: createOrderSchema.contact,
      },
    });
  }
}
