import {
  BookingStatus,
  BookingUnitItemSchema,
  DeliveryFormat,
  DeliveryMethod,
  DeliveryOption,
  RedemptionMethod,
} from '@octocloud/types';
import {
  BookingModel,
  OptionModel,
  UnitItemModel,
  UnitItemModelGenerator,
  UnitItemParser,
  UnitParser,
} from '@octocloud/generators';
import assert from 'assert';
import { InvalidUnitIdError } from '../models/Error';
import { DataGenerator } from '../generators/DataGenerator';

export abstract class UnitItemModelFactory {
  private static readonly unitItemModelGenerator: UnitItemModelGenerator = new UnitItemModelGenerator();

  private static readonly unitItemParser: UnitItemParser = new UnitItemParser();

  private static readonly unitParser: UnitParser = new UnitParser();

  public static createForBooking(
    bookingUnitItemSchema: BookingUnitItemSchema,
    bookingStatus: BookingStatus,
    optionModel: OptionModel,
    deliveryMethods: DeliveryMethod[],
  ): UnitItemModel {
    const unitModel = optionModel.findUnitModelByUnitId(bookingUnitItemSchema.unitId);

    if (unitModel === null) {
      throw new InvalidUnitIdError(bookingUnitItemSchema.unitId);
    }

    const unit = this.unitParser.parseModelToPOJO(unitModel);
    const ticketAvailable = deliveryMethods.includes(DeliveryMethod.TICKET);
    const ticket = ticketAvailable
      ? {
          redemptionMethod: RedemptionMethod.DIGITAL,
          utcRedeemedAt: null,
          deliveryOptions: [],
        }
      : null;

    return this.unitItemModelGenerator.generateUnitItem({
      unitItemData: {
        uuid: bookingUnitItemSchema.uuid ?? DataGenerator.generateUUID(),
        supplierReference: DataGenerator.generateSupplierReference(),
        resellerReference: bookingUnitItemSchema.resellerReference ?? null,
        unitId: unit.id,
        unit,
        status: bookingStatus,
        ticket,
      },
    });
  }

  public static createMultipleForBooking({
    bookingModel,
    bookingUnitItemSchemas,
  }: {
    bookingModel: BookingModel;
    bookingUnitItemSchemas?: BookingUnitItemSchema[];
  }): UnitItemModel[] {
    if (bookingUnitItemSchemas === undefined) {
      return bookingModel.unitItemModels;
    }

    return bookingUnitItemSchemas.map((bookingUnitItemSchema) =>
      this.createForBooking(
        bookingUnitItemSchema,
        bookingModel.status,
        bookingModel.optionModel,
        bookingModel.deliveryMethods,
      ),
    );
  }

  public static createMultipleForBookingWithTickets({
    bookingModel,
    bookingUnitItemSchemas,
  }: {
    bookingModel: BookingModel;
    bookingUnitItemSchemas?: BookingUnitItemSchema[];
  }): UnitItemModel[] {
    const unitItemModels = this.createMultipleForBooking({
      bookingModel,
      bookingUnitItemSchemas,
    });

    return unitItemModels.map((unitItemModel) => this.createForBookingWithTicket({ bookingModel, unitItemModel }));
  }

  public static createForBookingWithTicket({
    bookingModel,
    unitItemModel,
  }: {
    bookingModel: BookingModel;
    unitItemModel: UnitItemModel;
  }): UnitItemModel {
    if (!bookingModel.deliveryMethods.includes(DeliveryMethod.TICKET)) {
      // TODO check this, because before there was not an return statement outside of this condition
      return unitItemModel;
    }

    const deliveryOptions: DeliveryOption[] = [];
    if (bookingModel.productModel.deliveryFormats.includes(DeliveryFormat.PDF_URL)) {
      deliveryOptions.push({
        deliveryFormat: DeliveryFormat.PDF_URL,
        deliveryValue: `https://api.octomock.com/octo/pdf?booking=${bookingModel.uuid}&ticket=${unitItemModel.uuid}`,
      });
    }

    assert(unitItemModel.ticket !== null);

    if (bookingModel.productModel.deliveryFormats.includes(DeliveryFormat.QRCODE)) {
      assert(unitItemModel.supplierReference !== null);

      deliveryOptions.push({
        deliveryFormat: DeliveryFormat.QRCODE,
        deliveryValue: unitItemModel.supplierReference,
      });
    }
    const ticket = {
      ...unitItemModel.ticket,
      deliveryOptions,
    };

    const unitItem = this.unitItemParser.parseModelToPOJO(unitItemModel);
    unitItem.ticket = ticket;

    return this.unitItemParser.parsePOJOToModel(unitItem);
  }
}
