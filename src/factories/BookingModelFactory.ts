import { Availability, BookingStatus } from '@octocloud/types';
import {
  BookingModel,
  BookingModelGenerator,
  OptionParser,
  ProductModel,
  ProductParser,
  UnitItemParser,
} from '@octocloud/generators';
import { addMinutes } from 'date-fns';
import { InvalidOptionIdError } from '../models/Error';
import { CreateBookingSchema } from '../schemas/Booking';
import { DateHelper } from '../helpers/DateFormatter';
import { TicketFactory } from './TicketFactory';
import { DataGenerator } from '../generators/DataGenerator';
import { UnitItemModelFactory } from './UnitItemModelFactory';

export abstract class BookingModelFactory {
  private static readonly bookingModelGenerator: BookingModelGenerator = new BookingModelGenerator();

  private static readonly productParser: ProductParser = new ProductParser();

  private static readonly optionParser: OptionParser = new OptionParser();

  private static readonly unitItemParser: UnitItemParser = new UnitItemParser();

  public static create(
    productModel: ProductModel,
    bookingAvailability: Availability,
    createBookingSchema: CreateBookingSchema,
  ): BookingModel {
    const status = BookingStatus.ON_HOLD;

    const optionModel = productModel.findOptionModelByOptionId(createBookingSchema.optionId);
    if (optionModel === null) {
      throw new InvalidOptionIdError(createBookingSchema.optionId);
    }

    const utcExpiresAt = DateHelper.utcDateFormat(addMinutes(new Date(), createBookingSchema.expirationMinutes ?? 30));
    const voucher = TicketFactory.createFromProductForBooking(productModel);

    const unitItems = createBookingSchema.unitItems.map((unitItem) => {
      const unitItemModel = UnitItemModelFactory.createForBooking(
        unitItem,
        status,
        optionModel,
        productModel.deliveryMethods,
      );
      return this.unitItemParser.parseModelToPOJO(unitItemModel);
    });

    return this.bookingModelGenerator.generateBooking({
      bookingData: {
        id: DataGenerator.generateUUID(),
        uuid: createBookingSchema.uuid ?? DataGenerator.generateUUID(),
        resellerReference: createBookingSchema.resellerReference ?? null,
        supplierReference: DataGenerator.generateSupplierReference(),
        status,
        product: this.productParser.parseModelToPOJO(productModel),
        option: this.optionParser.parseModelToPOJO(optionModel),
        availability: bookingAvailability,
        unitItems,
        utcCreatedAt: DateHelper.utcDateFormat(new Date()),
        utcUpdatedAt: DateHelper.utcDateFormat(new Date()),
        utcExpiresAt,
        voucher,
        notes: createBookingSchema.notes ?? null,
      },
    });
  }
}
