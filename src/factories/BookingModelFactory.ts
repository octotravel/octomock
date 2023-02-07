import { BookingAvailability, BookingStatus } from "@octocloud/types";
import {
  BookingModel,
  BookingModelGenerator,
  OptionParser,
  ProductModel,
  ProductParser,
  UnitItemParser,
} from "@octocloud/generators";
import { InvalidOptionIdError } from "../models/Error";
import { CreateBookingSchema } from "../schemas/Booking";
import { DateHelper } from "../helpers/DateHelper";
import { addMinutes } from "date-fns";
import { TicketFactory } from "./TicketFactory";
import { DataGenerator } from "../generators/DataGenerator";
import { UnitItemModelFactory } from "./UnitItemModelFactory";

export abstract class BookingModelFactory {
  private static bookingModelGenerator: BookingModelGenerator = new BookingModelGenerator();
  private static productParser: ProductParser = new ProductParser();
  private static optionParser: OptionParser = new OptionParser();
  private static unitItemParser: UnitItemParser = new UnitItemParser();

  public static create(
    productModel: ProductModel,
    bookingAvailability: BookingAvailability,
    createBookingSchema: CreateBookingSchema
  ): BookingModel {
    const status = BookingStatus.ON_HOLD;

    const optionModel = productModel.findOptionModelByOptionId(createBookingSchema.optionId);
    if (optionModel === null) {
      throw new InvalidOptionIdError(createBookingSchema.optionId);
    }

    const utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), createBookingSchema.expirationMinutes ?? 30));
    const voucher = TicketFactory.createFromProductForBooking(productModel);

    const unitItemModels = createBookingSchema.unitItems.map((unitItem) => {
      const unitItemModel = UnitItemModelFactory.createForBooking(
        unitItem,
        status,
        optionModel,
        productModel.deliveryMethods
      );
      return this.unitItemParser.parseModelToPOJO(unitItemModel);
    });

    return this.bookingModelGenerator.generateBooking({
      bookingData: {
        id: DataGenerator.generateUUID(),
        uuid: createBookingSchema.uuid ?? DataGenerator.generateUUID(),
        resellerReference: createBookingSchema.resellerReference ?? null,
        supplierReference: DataGenerator.generateSupplierReference(),
        status: status,
        product: this.productParser.parseModelToPOJO(productModel),
        option: this.optionParser.parseModelToPOJO(optionModel),
        availability: bookingAvailability,
        unitItems: unitItemModels,
        utcCreatedAt: DateHelper.utcDateFormat(new Date()),
        utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
        utcExpiresAt: utcExpiresAt,
        voucher: voucher,
        notes: createBookingSchema.notes ?? null,
      },
    });
  }
}
