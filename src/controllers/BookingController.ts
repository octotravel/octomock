import { Booking, BookingStatus, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { BookingModel, BookingParser, OptionModel } from "@octocloud/generators";
import {
  UnprocessableEntityError,
  InvalidOptionIdError,
  InvalidUnitIdError,
} from "../models/Error";
import {
  CancelBookingSchema,
  ConfirmBookingSchema,
  CreateBookingSchema,
  ExtendBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  UpdateBookingSchema,
} from "../schemas/Booking";
import { AvailabilityService } from "../services/AvailabilityService";
import { BookingService } from "../services/BookingService";
import { BookingModelFactory } from "../factories/BookingModelFactory";
import { BookingRepository } from "../repositories/BookingRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { ContactMapper } from "../helpers/ContactHelper";

interface IBookingController {
  createBooking(schema: CreateBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  confirmBooking(schema: ConfirmBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  updateBooking(schema: UpdateBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  extendBooking(schema: ExtendBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  cancelBooking(schema: CancelBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  getBooking(schema: GetBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  getBookings(schema: GetBookingsSchema, capabilities: CapabilityId[]): Promise<Booking[]>;
}

export class BookingController implements IBookingController {
  private readonly bookingRepository = new BookingRepository();

  private readonly bookingService = new BookingService();

  private readonly productRepository = new ProductRepository();

  private readonly availabilityService = new AvailabilityService();

  private readonly bookingParser = new BookingParser();

  public createBooking = async (
    schema: CreateBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.createBookingModel(schema, capabilities);
    const createdBookingModel = await this.bookingRepository.createBooking(bookingModel);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
      createdBookingModel,
      capabilities,
    );
  };

  private createBookingModel = async (
    schema: CreateBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<BookingModel> => {
    const productWithAvailabilityModel = this.productRepository.getProductWithAvailability(
      schema.productId,
    );
    const availabilityModel = await this.availabilityService.findBookingAvailability(
      {
        productWithAvailabilityModel: productWithAvailabilityModel,
        optionId: schema.optionId,
        availabilityId: schema.availabilityId,
      },
      capabilities,
    );
    const bookingAvailability = {
      id: availabilityModel.id,
      localDateTimeStart: availabilityModel.localDateTimeStart,
      localDateTimeEnd: availabilityModel.localDateTimeEnd,
      allDay: availabilityModel.allDay,
      openingHours: availabilityModel.openingHours,
    };

    const optionId = schema.optionId;
    const optionModel = productWithAvailabilityModel.findOptionModelByOptionId(optionId);

    if (optionModel === null) {
      throw new InvalidOptionIdError(optionId);
    }

    schema.unitItems.forEach((bookingUnitItemSchema: BookingUnitItemSchema) => {
      const unitId = bookingUnitItemSchema.unitId;
      const unitModel = optionModel.findUnitModelByUnitId(unitId);

      if (unitModel === null) {
        throw new InvalidUnitIdError(unitId);
      }
    });

    this.checkRestrictions(optionModel, schema.unitItems);

    return BookingModelFactory.create(productWithAvailabilityModel, bookingAvailability, schema);
  };

  public confirmBooking = async (
    schema: ConfirmBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);

    if (bookingModel.status === BookingStatus.CONFIRMED) {
      return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
        bookingModel,
        capabilities,
      );
    }
    this.checkRestrictions(bookingModel.optionModel, schema.unitItems);

    const updatedBookingModel = this.bookingService.updateBookingModelWithConfirmBookingSchema(
      bookingModel,
      schema,
    );
    await this.bookingRepository.updateBooking(updatedBookingModel);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
      updatedBookingModel,
      capabilities,
    );
  };

  public updateBooking = async (
    schema: UpdateBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);

    if (bookingModel.cancellable === false) {
      throw new UnprocessableEntityError("booking cannot be updated");
    }

    let updatedBookingModel: BookingModel;

    if (
      schema.availabilityId ||
      (schema.productId && schema.optionId && schema.availabilityId && schema.unitItems)
    ) {
      const remappedUnitItems = bookingModel.unitItemModels.map((unitItemModel) => ({
        uuid: unitItemModel.uuid,
        unitId: unitItemModel.unitModel.id,
        resellerReference: unitItemModel.resellerReference ?? undefined,
        contact: ContactMapper.remapContactToBookingContactSchema(unitItemModel.contact),
      }));

      const rebookedBookingModel = await this.createBookingModel(
        {
          ...schema,
          productId: schema.productId ?? bookingModel.productModel.id,
          optionId: schema.optionId ?? bookingModel.optionModel.id,
          availabilityId: schema.availabilityId,
          unitItems: schema.unitItems ?? remappedUnitItems,
        },
        capabilities,
      );

      updatedBookingModel = this.bookingService.updateBookingModelWithUpdateBookingSchema(
        bookingModel,
        schema,
        rebookedBookingModel,
      );
      await this.bookingRepository.updateBooking(updatedBookingModel);
    } else {
      this.checkRestrictions(bookingModel.optionModel, schema.unitItems);

      updatedBookingModel = this.bookingService.updateBookingModelWithUpdateBookingSchema(
        bookingModel,
        schema,
      );
      await this.bookingRepository.updateBooking(updatedBookingModel);
    }

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
      updatedBookingModel,
      capabilities,
    );
  };

  public extendBooking = async (
    extendBookingSchema: ExtendBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(extendBookingSchema);
    if (bookingModel.status !== BookingStatus.ON_HOLD) {
      throw new UnprocessableEntityError("booking cannot be extended");
    }

    const extendedBookingModel = this.bookingService.updateBookingModelWithExtendBookingSchema(
      bookingModel,
      extendBookingSchema,
    );
    await this.bookingRepository.updateBooking(extendedBookingModel);
    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
  };

  public cancelBooking = async (
    cancelBookingSchema: CancelBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(cancelBookingSchema);

    if (bookingModel.cancellable === false) {
      throw new UnprocessableEntityError("booking not cancellable");
    }

    if (bookingModel.status === BookingStatus.CANCELLED) {
      return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
        bookingModel,
        capabilities,
      );
    }

    const cancelledBooking = this.bookingService.updateBookingModelWithCancelBookingSchema(
      bookingModel,
      cancelBookingSchema,
    );
    const updatedBookingModel = await this.bookingRepository.updateBooking(cancelledBooking);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(
      updatedBookingModel,
      capabilities,
    );
  };

  public getBooking = async (
    schema: GetBookingSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);
    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
  };

  public getBookings = async (
    schema: GetBookingsSchema,
    capabilities: CapabilityId[],
  ): Promise<Booking[]> => {
    const bookingModels = await this.bookingRepository.getBookings(schema);
    return bookingModels.map((bookingModel) =>
      this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities),
    );
  };

  private checkRestrictions = (
    optionModel: OptionModel,
    unitItems?: BookingUnitItemSchema[],
  ): void => {
    if (R.isEmpty(unitItems)) {
      throw new UnprocessableEntityError(
        "Validation failed: Tickets at least one ticket is required",
      );
    }

    const minUnits = optionModel.restrictions.minUnits;
    if (unitItems !== undefined && minUnits > unitItems.length) {
      throw new UnprocessableEntityError("minimal restrictions not met");
    }

    const maxUnits = optionModel.restrictions.maxUnits;
    if (unitItems !== undefined && maxUnits !== null && maxUnits < unitItems.length) {
      throw new UnprocessableEntityError("maximal restrictions not met");
    }
  };
}
